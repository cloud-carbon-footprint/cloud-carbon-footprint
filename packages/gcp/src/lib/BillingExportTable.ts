/*
 * © 2021 ThoughtWorks, Inc.
 */

import moment from 'moment'
import { BigQuery, Job, RowMetadata } from '@google-cloud/bigquery'

import {
  Logger,
  configLoader,
  EstimationResult,
  containsAny,
  convertByteSecondsToTerabyteHours,
  convertBytesToGigabytes,
  convertByteSecondsToGigabyteHours,
} from '@cloud-carbon-footprint/common'

import {
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  ComputeUsage,
  StorageUsage,
  NetworkingUsage,
  MemoryUsage,
  FootprintEstimate,
  MutableEstimationResult,
  appendOrAccumulateEstimatesByDay,
  COMPUTE_PROCESSOR_TYPES,
  CloudConstantsEmissionsFactors,
  CloudConstants,
} from '@cloud-carbon-footprint/core'

import {
  MEMORY_USAGE_TYPES,
  UNKNOWN_USAGE_TYPES,
  UNKNOWN_SERVICE_TYPES,
  COMPUTE_STRING_FORMATS,
  UNSUPPORTED_USAGE_TYPES,
  NETWORKING_STRING_FORMATS,
  GCP_QUERY_GROUP_BY,
} from './BillingExportTypes'
import {
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  SHARED_CORE_PROCESSORS,
} from './MachineTypes'
import BillingExportRow from './BillingExportRow'
import {
  GCP_CLOUD_CONSTANTS,
  GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { GCP_REPLICATION_FACTORS_FOR_SERVICES } from './ReplicationFactors'

export default class BillingExportTable {
  private readonly tableName: string
  private readonly billingExportTableLogger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly bigQuery: BigQuery,
  ) {
    this.tableName = configLoader().GCP.BIG_QUERY_TABLE
    this.billingExportTableLogger = new Logger('BillingExportTable')
  }

  async getEstimates(start: Date, end: Date): Promise<EstimationResult[]> {
    const usageRows = await this.getUsage(start, end)

    const results: MutableEstimationResult[] = []

    usageRows.map((usageRow) => {
      const billingExportRow = new BillingExportRow(usageRow)
      billingExportRow.setTimestamp(usageRow.timestamp)

      if (
        this.isUnknownUsage(billingExportRow) ||
        this.isUnsupportedUsage(billingExportRow.usageType)
      )
        return []

      let footprintEstimate: FootprintEstimate
      const emissionsFactors: CloudConstantsEmissionsFactors =
        GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
      const powerUsageEffectiveness: number = GCP_CLOUD_CONSTANTS.getPUE(
        billingExportRow.region,
      )
      switch (usageRow.usageUnit) {
        case 'seconds':
          if (this.isComputeUsage(billingExportRow.usageType))
            footprintEstimate = this.getComputeFootprintEstimate(
              billingExportRow,
              billingExportRow.timestamp,
              powerUsageEffectiveness,
              emissionsFactors,
            )
          else {
            return []
          }
          break
        case 'byte-seconds':
          if (this.isMemoryUsage(billingExportRow.usageType)) {
            footprintEstimate = this.getMemoryFootprintEstimate(
              billingExportRow,
              billingExportRow.timestamp,
              powerUsageEffectiveness,
              emissionsFactors,
            )
          } else {
            footprintEstimate = this.getStorageFootprintEstimate(
              billingExportRow,
              billingExportRow.timestamp,
              powerUsageEffectiveness,
              emissionsFactors,
            )
          }
          break
        case 'bytes':
          if (this.isNetworkingUsage(billingExportRow.usageType))
            footprintEstimate = this.getNetworkingFootprintEstimate(
              billingExportRow,
              billingExportRow.timestamp,
              powerUsageEffectiveness,
              emissionsFactors,
            )
          else {
            return []
          }
          break
        default:
          this.billingExportTableLogger.warn(
            `Unsupported Usage unit: ${usageRow.usageUnit}`,
          )
          return []
      }
      appendOrAccumulateEstimatesByDay(
        results,
        billingExportRow,
        footprintEstimate,
      )
    })
    return results
  }

  private getComputeFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const computeUsage: ComputeUsage = {
      cpuUtilizationAverage: GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: usageRow.vCpuHours,
      usesAverageCPUConstant: true,
      timestamp,
    }

    const computeProcessors = this.getComputeProcessorsFromUsageType(
      usageRow.usageType,
      usageRow.machineType,
    )

    const computeConstants: CloudConstants = {
      minWatts: GCP_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
      maxWatts: GCP_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
    }

    return this.computeEstimator.estimate(
      [computeUsage],
      usageRow.region,
      emissionsFactors,
      computeConstants,
    )[0]
  }

  private getComputeProcessorsFromUsageType(
    usageType: string,
    machineType: string,
  ): string[] {
    const sharedCoreMatch =
      machineType &&
      Object.values(SHARED_CORE_PROCESSORS).find((core) =>
        machineType.includes(core),
      )
    const includesPrefix = usageType.substring(0, 2).toLowerCase()
    const processor = sharedCoreMatch ? sharedCoreMatch : includesPrefix

    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[processor] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private getStorageFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    // storage estimation requires usage amount in terabyte hours
    const usageAmountTerabyteHours = convertByteSecondsToTerabyteHours(
      usageRow.usageAmount,
    )
    const storageUsage: StorageUsage = {
      timestamp,
      terabyteHours: usageAmountTerabyteHours,
    }
    const storageConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(usageRow),
    }

    const storageEstimator = usageRow.usageType.includes('SSD')
      ? this.ssdStorageEstimator
      : this.hddStorageEstimator
    return {
      usesAverageCPUConstant: false,
      ...storageEstimator.estimate(
        [storageUsage],
        usageRow.region,
        emissionsFactors,
        storageConstants,
      )[0],
    }
  }

  private getMemoryFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const memoryUsage: MemoryUsage = {
      timestamp,
      gigabyteHours: convertByteSecondsToGigabyteHours(usageRow.usageAmount),
    }
    const memoryConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
    }
    return {
      usesAverageCPUConstant: false,
      ...this.memoryEstimator.estimate(
        [memoryUsage],
        usageRow.region,
        emissionsFactors,
        memoryConstants,
      )[0],
    }
  }

  private getNetworkingFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const networkingUsage: NetworkingUsage = {
      timestamp,
      gigabytes: convertBytesToGigabytes(usageRow.usageAmount),
    }
    const networkingConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
    }

    return {
      usesAverageCPUConstant: false,
      ...this.networkingEstimator.estimate(
        [networkingUsage],
        usageRow.region,
        emissionsFactors,
        networkingConstants,
      )[0],
    }
  }

  private isUnknownUsage(usageRow: BillingExportRow): boolean {
    return (
      containsAny(UNKNOWN_USAGE_TYPES, usageRow.usageType) ||
      containsAny(UNKNOWN_SERVICE_TYPES, usageRow.serviceName) ||
      !usageRow.usageType
    )
  }

  private isMemoryUsage(usageType: string): boolean {
    // We only want to ignore memory usage that is not also compute usage (determined by containing VCPU usage)
    return (
      containsAny(MEMORY_USAGE_TYPES, usageType) &&
      !containsAny(COMPUTE_STRING_FORMATS, usageType)
    )
  }

  private isUnsupportedUsage(usageType: string): boolean {
    return containsAny(UNSUPPORTED_USAGE_TYPES, usageType)
  }

  private isComputeUsage(usageType: string): boolean {
    return containsAny(COMPUTE_STRING_FORMATS, usageType)
  }

  private isNetworkingUsage(usageType: string): boolean {
    return containsAny(NETWORKING_STRING_FORMATS, usageType)
  }

  private getReplicationFactor(usageRow: BillingExportRow): number {
    return (
      GCP_REPLICATION_FACTORS_FOR_SERVICES[usageRow.serviceName] &&
      GCP_REPLICATION_FACTORS_FOR_SERVICES[usageRow.serviceName](
        usageRow.usageType,
        usageRow.region,
      )
    )
  }

  private async getUsage(start: Date, end: Date): Promise<RowMetadata[]> {
    const query = `SELECT
                    DATE_TRUNC(DATE(usage_start_time), ${
                      GCP_QUERY_GROUP_BY[configLoader().GROUP_QUERY_RESULTS_BY]
                    }) as timestamp,
                    project.id as accountId,
                    project.name as accountName,
                    ifnull(location.region, location.location) as region,
                    service.description as serviceName,
                    sku.description as usageType,
                    usage.unit as usageUnit,
                    system_labels.value AS machineType,
                    SUM(usage.amount) AS usageAmount,
                    SUM(cost) AS cost
                  FROM
                    \`${this.tableName}\`
                  LEFT JOIN
                    UNNEST(system_labels) AS system_labels
                    ON system_labels.key = "compute.googleapis.com/machine_spec"
                  WHERE
                    cost_type != 'rounding_error'
                    AND usage.unit IN ('byte-seconds', 'seconds', 'bytes')
                    AND usage_start_time >= TIMESTAMP('${moment
                      .utc(start)
                      .format('YYYY-MM-DD')}')
                    AND usage_end_time <= TIMESTAMP('${moment
                      .utc(end)
                      .format('YYYY-MM-DD')}')
                  GROUP BY
                    timestamp,
                    accountId,
                    accountName,
                    region,
                    serviceName,
                    usageType,
                    usageUnit,
                    machineType`

    const job: Job = await this.createQueryJob(query)
    return await this.getQueryResults(job)
  }

  private async getQueryResults(job: Job) {
    let rows: RowMetadata
    try {
      ;[rows] = await job.getQueryResults()
    } catch (e) {
      const { reason, domain, message } = e.errors[0]
      throw new Error(
        `BigQuery get Query Results failed. Reason: ${reason}, Domain: ${domain}, Message: ${message}`,
      )
    }
    return rows
  }

  private async createQueryJob(query: string) {
    let job: Job
    try {
      ;[job] = await this.bigQuery.createQueryJob({ query: query })
    } catch (e) {
      const { reason, location, message } = e.errors[0]
      throw new Error(
        `BigQuery create Query Job failed. Reason: ${reason}, Location: ${location}, Message: ${message}`,
      )
    }
    return job
  }
}
