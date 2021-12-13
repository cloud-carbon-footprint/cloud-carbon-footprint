/*
 * © 2021 Thoughtworks, Inc.
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
  LookupTableInput,
  LookupTableOutput,
  GroupBy,
} from '@cloud-carbon-footprint/common'

import {
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  UnknownEstimator,
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
  UnknownUsage,
  accumulateCo2PerCost,
  EstimateClassification,
  EmbodiedEmissionsUsage,
  EmbodiedEmissionsEstimator,
} from '@cloud-carbon-footprint/core'

import {
  MEMORY_USAGE_TYPES,
  UNKNOWN_USAGE_TYPES,
  UNKNOWN_SERVICE_TYPES,
  COMPUTE_STRING_FORMATS,
  UNSUPPORTED_USAGE_TYPES,
  NETWORKING_STRING_FORMATS,
  GCP_QUERY_GROUP_BY,
  UNKNOWN_USAGE_UNITS,
  UNKNOWN_USAGE_UNIT_TO_ASSUMED_USAGE_MAPPING,
  UNKNOWN_USAGE_TYPE_TO_ASSUMED_USAGE_MAPPING,
} from './BillingExportTypes'
import {
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING,
  MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING,
  N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING,
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
    private readonly unknownEstimator: UnknownEstimator,
    private readonly embodiedEmissionsEstimator: EmbodiedEmissionsEstimator,
    private readonly bigQuery?: BigQuery,
  ) {
    this.tableName = configLoader().GCP.BIG_QUERY_TABLE
    this.billingExportTableLogger = new Logger('BillingExportTable')
  }

  async getEstimates(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    const usageRows = await this.getUsage(start, end, grouping)

    const results: MutableEstimationResult[] = []
    const unknownRows: BillingExportRow[] = []

    usageRows.map((usageRow) => {
      const billingExportRow = new BillingExportRow(usageRow)
      const footprintEstimate = this.getFootprintEstimateFromUsageRow(
        billingExportRow,
        unknownRows,
      )
      if (footprintEstimate)
        appendOrAccumulateEstimatesByDay(
          results,
          billingExportRow,
          footprintEstimate,
        )
    })

    if (results.length > 0) {
      unknownRows.map((rowData: BillingExportRow) => {
        const footprintEstimate = this.getEstimateForUnknownUsage(rowData)
        if (footprintEstimate)
          appendOrAccumulateEstimatesByDay(results, rowData, footprintEstimate)
      })
    }
    return results
  }

  getEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const results: LookupTableOutput[] = []
    const unknownRows: BillingExportRow[] = []

    inputData.map((inputDataRow: LookupTableInput) => {
      const usageRow = {
        serviceName: inputDataRow.serviceName,
        usageAmount: 1,
        usageType: inputDataRow.usageType,
        usageUnit: inputDataRow.usageUnit,
        cost: 1,
        region: inputDataRow.region,
        machineType: inputDataRow.machineType,
        timestamp: new Date(''),
      }

      const billingExportRow = new BillingExportRow(usageRow)
      const footprintEstimate = this.getFootprintEstimateFromUsageRow(
        billingExportRow,
        unknownRows,
      )
      if (footprintEstimate)
        results.push({
          serviceName: billingExportRow.serviceName,
          region: billingExportRow.region,
          usageType: billingExportRow.usageType,
          usageUnit: billingExportRow.usageUnit,
          machineType: billingExportRow.machineType,
          kilowattHours: footprintEstimate.kilowattHours,
          co2e: footprintEstimate.co2e,
        })
    })

    if (results.length > 0) {
      unknownRows.map((billingExportRow: BillingExportRow) => {
        const footprintEstimate =
          this.getEstimateForUnknownUsage(billingExportRow)
        if (footprintEstimate)
          results.push({
            serviceName: billingExportRow.serviceName,
            region: billingExportRow.region,
            usageType: billingExportRow.usageType,
            usageUnit: billingExportRow.usageUnit,
            machineType: billingExportRow.machineType,
            kilowattHours: footprintEstimate.kilowattHours,
            co2e: footprintEstimate.co2e,
          })
      })
    }
    return results
  }

  private getFootprintEstimateFromUsageRow(
    billingExportRow: BillingExportRow,
    unknownRows: BillingExportRow[],
  ): FootprintEstimate | void {
    if (this.isUnsupportedUsage(billingExportRow.usageType)) return

    if (this.isUnknownUsage(billingExportRow)) {
      unknownRows.push(billingExportRow)
      return
    }

    return this.getEstimateByUsageUnit(billingExportRow, unknownRows)
  }

  private getEstimateByUsageUnit(
    billingExportRow: BillingExportRow,
    unknownRows: BillingExportRow[],
  ): FootprintEstimate | void {
    const emissionsFactors: CloudConstantsEmissionsFactors =
      GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
    const powerUsageEffectiveness: number = GCP_CLOUD_CONSTANTS.getPUE(
      billingExportRow.region,
    )
    switch (billingExportRow.usageUnit) {
      case 'seconds':
        if (this.isComputeUsage(billingExportRow.usageType)) {
          const computeFootprint = this.getComputeFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )

          const embodiedEmissions = this.getEmbodiedEmissions(
            billingExportRow,
            emissionsFactors,
          )

          if (embodiedEmissions.co2e) {
            return {
              timestamp: computeFootprint.timestamp,
              kilowattHours:
                computeFootprint.kilowattHours +
                embodiedEmissions.kilowattHours,
              co2e: computeFootprint.co2e + embodiedEmissions.co2e,
              usesAverageCPUConstant: computeFootprint.usesAverageCPUConstant,
            }
          }

          return computeFootprint
        } else {
          unknownRows.push(billingExportRow)
        }
        break
      case 'byte-seconds':
        if (this.isMemoryUsage(billingExportRow.usageType)) {
          return this.getMemoryFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )
        } else {
          return this.getStorageFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )
        }
      case 'bytes':
        if (this.isNetworkingUsage(billingExportRow.usageType)) {
          return this.getNetworkingFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )
        } else {
          unknownRows.push(billingExportRow)
        }
        break
      default:
        this.billingExportTableLogger.warn(
          `Unsupported Usage unit: ${billingExportRow.usageUnit}`,
        )
        break
    }
  }

  private getComputeFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const computeUsage: ComputeUsage = {
      cpuUtilizationAverage: GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: usageRow.vCpuHours,
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

    const computeFootprint = this.computeEstimator.estimate(
      [computeUsage],
      usageRow.region,
      emissionsFactors,
      computeConstants,
    )[0]

    if (computeFootprint)
      accumulateCo2PerCost(
        EstimateClassification.COMPUTE,
        computeFootprint.co2e,
        usageRow.cost,
        GCP_CLOUD_CONSTANTS.CO2E_PER_COST,
      )

    return computeFootprint
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

  private getEmbodiedEmissions(
    usageRow: BillingExportRow,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const { instancevCpu, scopeThreeEmissions, largestInstancevCpu } =
      this.getDataFromMachineType(usageRow.machineType)

    const embodiedEmissionsUsage: EmbodiedEmissionsUsage = {
      instancevCpu,
      largestInstancevCpu,
      usageTimePeriod: usageRow.usageAmount / instancevCpu / 3600,
      scopeThreeEmissions,
    }

    return this.embodiedEmissionsEstimator.estimate(
      [embodiedEmissionsUsage],
      usageRow.region,
      emissionsFactors,
    )[0]
  }

  private getDataFromMachineType(machineType: string): {
    [key: string]: number
  } {
    if (!machineType) {
      return {
        instancevCpu: 0,
        scopeThreeEmissions: 0,
        largestInstancevCpu: 0,
      }
    }

    const machineFamily = machineType?.split('-').slice(0, 2).join('-')
    const [machineFamilySharedCore] = machineType?.split('-')

    const instancevCpu =
      MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineFamily]?.[
        machineType
      ]?.[0] ||
      MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING[
        machineFamilySharedCore
      ]?.[machineType]?.[0] ||
      N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineType]?.[0]

    const scopeThreeEmissions =
      MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineFamily]?.[
        machineType
      ]?.[1] ||
      MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING[
        machineFamilySharedCore
      ]?.[machineType]?.[1] ||
      N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineType]?.[1]

    const familyMachineTypes: number[][] = Object.values(
      MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineFamily] ||
        MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING[
          machineFamilySharedCore
        ] ||
        N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING,
    )

    const largestInstancevCpu =
      familyMachineTypes[familyMachineTypes.length - 1][0]

    return {
      instancevCpu,
      scopeThreeEmissions,
      largestInstancevCpu,
    }
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

    const storageFootprint = storageEstimator.estimate(
      [storageUsage],
      usageRow.region,
      emissionsFactors,
      storageConstants,
    )[0]

    if (storageFootprint) {
      storageFootprint.usesAverageCPUConstant = false
      accumulateCo2PerCost(
        EstimateClassification.STORAGE,
        storageFootprint.co2e,
        usageRow.cost,
        GCP_CLOUD_CONSTANTS.CO2E_PER_COST,
      )
    }

    return storageFootprint
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

    const memoryFootprint = this.memoryEstimator.estimate(
      [memoryUsage],
      usageRow.region,
      emissionsFactors,
      memoryConstants,
    )[0]

    if (memoryFootprint) {
      memoryFootprint.usesAverageCPUConstant = false
      accumulateCo2PerCost(
        EstimateClassification.MEMORY,
        memoryFootprint.co2e,
        usageRow.cost,
        GCP_CLOUD_CONSTANTS.CO2E_PER_COST,
      )
    }

    return memoryFootprint
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

    const networkingFootprint = this.networkingEstimator.estimate(
      [networkingUsage],
      usageRow.region,
      emissionsFactors,
      networkingConstants,
    )[0]

    if (networkingFootprint) {
      networkingFootprint.usesAverageCPUConstant = false
      accumulateCo2PerCost(
        EstimateClassification.NETWORKING,
        networkingFootprint.co2e,
        usageRow.cost,
        GCP_CLOUD_CONSTANTS.CO2E_PER_COST,
      )
    }

    return networkingFootprint
  }

  private isUnknownUsage(usageRow: BillingExportRow): boolean {
    return (
      containsAny(UNKNOWN_USAGE_TYPES, usageRow.usageType) ||
      containsAny(UNKNOWN_SERVICE_TYPES, usageRow.serviceName) ||
      containsAny(UNKNOWN_USAGE_UNITS, usageRow.usageUnit) ||
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

  private getEstimateForUnknownUsage(
    rowData: BillingExportRow,
  ): FootprintEstimate {
    const unknownUsage: UnknownUsage = {
      timestamp: rowData.timestamp,
      cost: rowData.cost,
      usageUnit: rowData.usageUnit,
      usageType: rowData.usageType,
      reclassificationType: this.getUnknownReclassification(
        rowData.usageType,
        rowData.usageUnit,
      ),
    }
    const unknownConstants: CloudConstants = {
      co2ePerCost: GCP_CLOUD_CONSTANTS.CO2E_PER_COST,
    }
    return this.unknownEstimator.estimate(
      [unknownUsage],
      rowData.region,
      GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      unknownConstants,
    )[0]
  }

  getUnknownReclassification(usageType: string, usageUnit: string): string {
    if (usageUnit === 'byte-seconds') {
      if (containsAny(['Memory'], usageType)) {
        return EstimateClassification.MEMORY
      }
      return EstimateClassification.STORAGE
    }

    for (const key in UNKNOWN_USAGE_TYPE_TO_ASSUMED_USAGE_MAPPING) {
      if (usageType.includes(key)) {
        return UNKNOWN_USAGE_TYPE_TO_ASSUMED_USAGE_MAPPING[key]
      }
    }

    return UNKNOWN_USAGE_UNIT_TO_ASSUMED_USAGE_MAPPING[usageUnit]?.[0]
      ? UNKNOWN_USAGE_UNIT_TO_ASSUMED_USAGE_MAPPING[usageUnit][0]
      : EstimateClassification.UNKNOWN
  }

  private async getUsage(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<RowMetadata[]> {
    const query = `SELECT
                    DATE_TRUNC(DATE(usage_start_time), ${
                      GCP_QUERY_GROUP_BY[grouping]
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
