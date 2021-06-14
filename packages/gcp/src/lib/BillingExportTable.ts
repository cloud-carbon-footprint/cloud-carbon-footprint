/*
 * © 2021 ThoughtWorks, Inc.
 */

import moment from 'moment'
import { BigQuery, Job, RowMetadata } from '@google-cloud/bigquery'

import {
  Logger,
  configLoader,
  EstimationResult,
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
        this.getEmissionsFactors()
      const powerUsageEffectiveness: number = this.getPowerUsageEffectiveness(
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
      minWatts: this.getMinwatts(computeProcessors),
      maxWatts: this.getMaxwatts(computeProcessors),
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
    const usageAmountTerabyteHours = this.convertByteSecondsToTerabyteHours(
      usageRow.usageAmount,
    )
    const storageUsage: StorageUsage = {
      timestamp,
      terabyteHours: usageAmountTerabyteHours,
    }
    const storageConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(
        usageRow.usageType,
        usageRow.serviceName,
      ),
    }
    if (usageRow.usageType.includes('SSD')) {
      return {
        usesAverageCPUConstant: false,
        ...this.ssdStorageEstimator.estimate(
          [storageUsage],
          usageRow.region,
          emissionsFactors,
          storageConstants,
        )[0],
      }
    }
    return {
      usesAverageCPUConstant: false,
      ...this.hddStorageEstimator.estimate(
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
      gigabyteHours: this.convertByteSecondsToGigabyteHours(
        usageRow.usageAmount,
      ),
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
      gigabytes: this.convertBytesToGigabytes(usageRow.usageAmount),
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
      this.containsAny(UNKNOWN_USAGE_TYPES, usageRow.usageType) ||
      this.containsAny(UNKNOWN_SERVICE_TYPES, usageRow.serviceName) ||
      !usageRow.usageType
    )
  }

  private isMemoryUsage(usageType: string): boolean {
    // We only want to ignore memory usage that is not also compute usage (determined by containing VCPU usage)
    return (
      this.containsAny(MEMORY_USAGE_TYPES, usageType) &&
      !this.containsAny(COMPUTE_STRING_FORMATS, usageType)
    )
  }

  private isUnsupportedUsage(usageType: string): boolean {
    return this.containsAny(UNSUPPORTED_USAGE_TYPES, usageType)
  }

  private isComputeUsage(usageType: string): boolean {
    return this.containsAny(COMPUTE_STRING_FORMATS, usageType)
  }

  private isNetworkingUsage(usageType: string): boolean {
    return this.containsAny(NETWORKING_STRING_FORMATS, usageType)
  }

  private containsAny(substrings: string[], stringToSearch: string): boolean {
    return substrings.some((substring) =>
      new RegExp(`\\b${substring}\\b`).test(stringToSearch),
    )
  }

  private getMinwatts(computeProcessors: string[]): number {
    return GCP_CLOUD_CONSTANTS.getMinWatts(computeProcessors)
  }

  private getMaxwatts(computeProcessors: string[]): number {
    return GCP_CLOUD_CONSTANTS.getMaxWatts(computeProcessors)
  }

  private getPowerUsageEffectiveness(region: string): number {
    return GCP_CLOUD_CONSTANTS.getPUE(region)
  }

  private getEmissionsFactors(): { [region: string]: number } {
    return GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
  }

  private async getUsage(start: Date, end: Date): Promise<RowMetadata[]> {
    const query = `SELECT
                    DATE_TRUNC(DATE(usage_start_time), ${
                      GCP_QUERY_GROUP_BY[configLoader().GROUP_QUERY_RESULTS_BY]
                    }) as timestamp,
                    project.name as accountName,
                    location.region as region,
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

  private convertByteSecondsToTerabyteHours(usageAmount: number): number {
    // This function converts byte-seconds into terabyte hours by first converting bytes to terabytes, then seconds to hours.
    return usageAmount / 1099511627776 / 3600
  }

  private convertBytesToGigabytes(usageAmount: number): number {
    return usageAmount / 1073741824
  }

  private convertByteSecondsToGigabyteHours(usageAmount: number): number {
    return usageAmount / 1073741824 / 3600
  }

  private getReplicationFactor(usageType: string, serviceName: string): number {
    switch (serviceName) {
      case 'Cloud Storage':
        if (usageType.includes('Dual-region'))
          return GCP_CLOUD_CONSTANTS.REPLICATION_FACTORS
            .CLOUD_STORAGE_DUAL_REGION // 4
        if (usageType.includes('Multi-region')) {
          return GCP_CLOUD_CONSTANTS.REPLICATION_FACTORS
            .CLOUD_STORAGE_MULTI_REGION // 6
        }
        return GCP_CLOUD_CONSTANTS.REPLICATION_FACTORS
          .CLOUD_STORAGE_SINGLE_REGION // 2
      case 'Compute Engine':
        if (usageType === 'Storage PD Capacity')
          return GCP_CLOUD_CONSTANTS.REPLICATION_FACTORS
            .COMPUTE_ENGINE_REGIONAL_DISKS // 2
        break
      case 'Cloud Filestore':
        return GCP_CLOUD_CONSTANTS.REPLICATION_FACTORS.CLOUD_FILESTORE // 2
      case 'Cloud SQL':
        if (usageType.includes('Regional - Standard storage'))
          return GCP_CLOUD_CONSTANTS.REPLICATION_FACTORS
            .CLOUD_SQL_HIGH_AVAILABILITY // 2
        break
      case 'Cloud Memorystore for Redis':
        return GCP_CLOUD_CONSTANTS.REPLICATION_FACTORS.CLOUD_MEMORY_STORE_REDIS // 2
    }
  }
}
