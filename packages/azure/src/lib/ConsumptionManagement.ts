/*
 * © 2021 Thoughtworks, Inc.
 */
import moment, { unitOfTime } from 'moment'
import { ConsumptionManagementClient } from '@azure/arm-consumption'
import {
  LegacyUsageDetail,
  UsageDetailsListResult,
} from '@azure/arm-consumption/esm/models'

import {
  configLoader,
  Logger,
  EstimationResult,
  convertTerabytesToGigabytes,
  convertGigaBytesToTerabyteHours,
  containsAny,
  wait,
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
  UnknownUsage,
  FootprintEstimate,
  appendOrAccumulateEstimatesByDay,
  MutableEstimationResult,
  COMPUTE_PROCESSOR_TYPES,
  CloudConstants,
  CloudConstantsEmissionsFactors,
  calculateGigabyteHours,
  getPhysicalChips,
  accumulateCo2PerCost,
  EstimateClassification,
} from '@cloud-carbon-footprint/core'

import ConsumptionDetailRow from './ConsumptionDetailRow'
import {
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
} from './VirtualMachineTypes'
import {
  COMPUTE_USAGE_UNITS,
  CONTAINER_REGISTRY_STORAGE_GB,
  HDD_MANAGED_DISKS_STORAGE_GB,
  NETWORKING_USAGE_TYPES,
  NETWORKING_USAGE_UNITS,
  MEMORY_USAGE_TYPES,
  MEMORY_USAGE_UNITS,
  SSD_MANAGED_DISKS_STORAGE_GB,
  STORAGE_USAGE_TYPES,
  STORAGE_USAGE_UNITS,
  UNSUPPORTED_USAGE_TYPES,
  AZURE_QUERY_GROUP_BY,
  CACHE_MEMORY_GB,
  TenantHeaders,
  UNKNOWN_SERVICES,
  UNKNOWN_USAGE_TYPES,
  UNKNOWN_USAGE_TO_ASSUMED_USAGE_MAPPING,
} from './ConsumptionTypes'

import { AZURE_REPLICATION_FACTORS_FOR_SERVICES } from './ReplicationFactors'

import {
  AZURE_CLOUD_CONSTANTS,
  AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

export default class ConsumptionManagementService {
  private readonly consumptionManagementLogger: Logger
  private readonly consumptionManagementRateLimitRemainingHeader: string
  private readonly consumptionManagementRetryAfterHeader: string
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly unknownEstimator: UnknownEstimator,
    private readonly consumptionManagementClient: ConsumptionManagementClient,
  ) {
    this.consumptionManagementLogger = new Logger('ConsumptionManagement')
    this.consumptionManagementRateLimitRemainingHeader =
      'x-ms-ratelimit-remaining-microsoft.consumption-tenant-requests'
    this.consumptionManagementRetryAfterHeader =
      'x-ms-ratelimit-microsoft.consumption-tenant-retry-after'
  }

  public async getEstimates(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const usageRows = await this.getConsumptionUsageDetails(startDate, endDate)
    const allUsageRows = await this.pageThroughUsageRows(usageRows)
    const results: MutableEstimationResult[] = []
    const unknownRows: ConsumptionDetailRow[] = []

    allUsageRows.map((consumptionRow: LegacyUsageDetail) => {
      const consumptionDetailRow: ConsumptionDetailRow =
        new ConsumptionDetailRow(consumptionRow)

      this.updateTimestampByWeek(consumptionDetailRow)

      if (this.isUnsupportedUsage(consumptionDetailRow)) {
        return []
      }

      if (this.isUnknownUsage(consumptionDetailRow)) {
        unknownRows.push(consumptionDetailRow)
        return []
      }

      const footprintEstimate =
        this.getEstimateByPricingUnit(consumptionDetailRow)

      if (footprintEstimate) {
        appendOrAccumulateEstimatesByDay(
          results,
          consumptionDetailRow,
          footprintEstimate,
        )
      }
    })

    if (results.length > 0) {
      unknownRows.map((rowData: ConsumptionDetailRow) => {
        const footprintEstimate = this.getEstimateForUnknownUsage(rowData)
        if (footprintEstimate)
          appendOrAccumulateEstimatesByDay(results, rowData, footprintEstimate)
      })
    }

    return results
  }

  private updateTimestampByWeek(
    consumptionDetailRow: ConsumptionDetailRow,
  ): void {
    const startOfType: string =
      AZURE_QUERY_GROUP_BY[configLoader().GROUP_QUERY_RESULTS_BY]
    const firstDayOfWeek = moment
      .utc(consumptionDetailRow.timestamp)
      .startOf(startOfType as unitOfTime.StartOf)
    consumptionDetailRow.timestamp = new Date(firstDayOfWeek.toISOString())
  }

  private async pageThroughUsageRows(
    usageRows: UsageDetailsListResult,
  ): Promise<UsageDetailsListResult> {
    const allUsageRows = [...usageRows]
    let retry = false
    while (usageRows.nextLink) {
      try {
        const nextUsageRows =
          await this.consumptionManagementClient.usageDetails.listNext(
            usageRows.nextLink,
          )
        allUsageRows.push(...nextUsageRows)
        usageRows = nextUsageRows
      } catch (e) {
        // check to see if error is from exceeding the rate limit and grab retry time value
        const retryAfterValue = this.getConsumptionTenantValue(e, 'retry')
        const rateLimitRemaingValue = this.getConsumptionTenantValue(
          e,
          'remaining',
        )
        const errorMsg =
          'Azure ConsumptionManagementClient.usageDetails.listNext failed. Reason:'
        if (rateLimitRemaingValue == 0) {
          this.consumptionManagementLogger.warn(`${errorMsg} ${e.message}`)
          this.consumptionManagementLogger.info(
            `Retrying after ${retryAfterValue} seconds`,
          )
          retry = true
          await wait(retryAfterValue * 1000)
        } else {
          throw new Error(`${errorMsg} ${e.message}`)
        }
      }
    }
    retry &&
      this.consumptionManagementLogger.info(
        'Retry Successful! Continuing grabbing estimates...',
      )
    return allUsageRows
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getConsumptionTenantValue(e: any, type: string) {
    const tenantHeaders: TenantHeaders = {
      retry: this.consumptionManagementRetryAfterHeader,
      remaining: this.consumptionManagementRateLimitRemainingHeader,
    }
    return e.response.headers._headersMap[tenantHeaders[type]]?.value
  }

  private async getConsumptionUsageDetails(startDate: Date, endDate: Date) {
    try {
      const options = {
        expand: 'properties/meterDetails',
        filter: `properties/usageStart ge '${startDate.toISOString()}' AND properties/usageEnd le '${endDate.toISOString()}'`,
      }
      return await this.consumptionManagementClient.usageDetails.list(
        `/subscriptions/${this.consumptionManagementClient.subscriptionId}/`,
        options,
      )
    } catch (e) {
      throw new Error(
        `Azure ConsumptionManagementClient.usageDetails.list failed. Reason: ${e.message}`,
      )
    }
  }

  private getEstimateByPricingUnit(
    consumptionDetailRow: ConsumptionDetailRow,
  ): FootprintEstimate {
    const emissionsFactors: CloudConstantsEmissionsFactors =
      AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
    const powerUsageEffectiveness: number = AZURE_CLOUD_CONSTANTS.getPUE(
      consumptionDetailRow.region,
    )
    switch (consumptionDetailRow.usageUnit) {
      case COMPUTE_USAGE_UNITS.HOUR_1:
      case COMPUTE_USAGE_UNITS.HOURS_10:
      case COMPUTE_USAGE_UNITS.HOURS_100:
      case COMPUTE_USAGE_UNITS.HOURS_1000:
        const computeFootprint = this.getComputeFootprintEstimate(
          consumptionDetailRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )

        const memoryFootprint = this.getMemoryFootprintEstimate(
          consumptionDetailRow,
          powerUsageEffectiveness,
          emissionsFactors,
          true,
        )

        // if memory usage, only return the memory footprint
        if (this.isMemoryUsage(consumptionDetailRow.usageType)) {
          return memoryFootprint
        }

        // if there exist any kilowatt hours from a memory footprint,
        // add the kwh and co2e for both compute and memory
        if (memoryFootprint.kilowattHours) {
          accumulateCo2PerCost(
            EstimateClassification.COMPUTE,
            computeFootprint.co2e + memoryFootprint.co2e,
            consumptionDetailRow.cost,
            AZURE_CLOUD_CONSTANTS.CO2E_PER_COST,
          )

          return {
            timestamp: memoryFootprint.timestamp,
            kilowattHours:
              computeFootprint.kilowattHours + memoryFootprint.kilowattHours,
            co2e: computeFootprint.co2e + memoryFootprint.co2e,
            usesAverageCPUConstant: computeFootprint.usesAverageCPUConstant,
          }
        }

        if (computeFootprint)
          accumulateCo2PerCost(
            EstimateClassification.COMPUTE,
            computeFootprint.co2e,
            consumptionDetailRow.cost,
            AZURE_CLOUD_CONSTANTS.CO2E_PER_COST,
          )

        return computeFootprint
      case STORAGE_USAGE_UNITS.MONTH_1:
      case STORAGE_USAGE_UNITS.MONTH_100:
      case STORAGE_USAGE_UNITS.GB_MONTH_1:
      case STORAGE_USAGE_UNITS.GB_MONTH_10:
      case STORAGE_USAGE_UNITS.GB_MONTH_100:
      case STORAGE_USAGE_UNITS.DAY_10:
      case STORAGE_USAGE_UNITS.DAY_30:
      case STORAGE_USAGE_UNITS.TB_MONTH_1:
        return this.getStorageFootprintEstimate(
          consumptionDetailRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )
      case NETWORKING_USAGE_UNITS.GB_1:
      case NETWORKING_USAGE_UNITS.GB_10:
      case NETWORKING_USAGE_UNITS.GB_100:
      case NETWORKING_USAGE_UNITS.GB_200:
      case NETWORKING_USAGE_UNITS.TB_1:
        return this.getNetworkingFootprintEstimate(
          consumptionDetailRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )
      case MEMORY_USAGE_UNITS.GB_SECONDS_50000:
      case MEMORY_USAGE_UNITS.GB_HOURS_1000:
        return this.getMemoryFootprintEstimate(
          consumptionDetailRow,
          powerUsageEffectiveness,
          emissionsFactors,
          false,
        )
      default:
        this.consumptionManagementLogger.warn(
          `Unsupported usage unit: ${consumptionDetailRow.usageUnit}`,
        )
    }
  }

  private getNetworkingFootprintEstimate(
    consumptionDetailRow: ConsumptionDetailRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ) {
    let networkingEstimate: FootprintEstimate
    if (this.isNetworkingUsage(consumptionDetailRow)) {
      const networkingUsage: NetworkingUsage = {
        timestamp: consumptionDetailRow.timestamp,
        gigabytes: this.getGigabytesForNetworking(consumptionDetailRow),
      }

      const networkingConstants: CloudConstants = {
        powerUsageEffectiveness: powerUsageEffectiveness,
      }

      networkingEstimate = this.networkingEstimator.estimate(
        [networkingUsage],
        consumptionDetailRow.region,
        emissionsFactors,
        networkingConstants,
      )[0]
    }

    if (networkingEstimate) {
      networkingEstimate.usesAverageCPUConstant = false
      accumulateCo2PerCost(
        EstimateClassification.NETWORKING,
        networkingEstimate.co2e,
        consumptionDetailRow.cost,
        AZURE_CLOUD_CONSTANTS.CO2E_PER_COST,
      )
    }
    return networkingEstimate
  }

  private getStorageFootprintEstimate(
    consumptionDetailRow: ConsumptionDetailRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ) {
    const usageAmountTerabyteHours =
      this.getUsageAmountInTerabyteHours(consumptionDetailRow)

    const storageUsage: StorageUsage = {
      timestamp: consumptionDetailRow.timestamp,
      terabyteHours: usageAmountTerabyteHours,
    }

    const storageConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(consumptionDetailRow),
    }

    let estimate: FootprintEstimate
    if (this.isSSDStorage(consumptionDetailRow))
      estimate = this.ssdStorageEstimator.estimate(
        [storageUsage],
        consumptionDetailRow.region,
        emissionsFactors,
        storageConstants,
      )[0]
    else if (this.isHDDStorage(consumptionDetailRow))
      estimate = this.hddStorageEstimator.estimate(
        [storageUsage],
        consumptionDetailRow.region,
        emissionsFactors,
        storageConstants,
      )[0]
    else
      this.consumptionManagementLogger.warn(
        `Unexpected usage type for storage service: ${consumptionDetailRow.usageType}`,
      )
    if (estimate) {
      estimate.usesAverageCPUConstant = false
      accumulateCo2PerCost(
        EstimateClassification.STORAGE,
        estimate.co2e,
        consumptionDetailRow.cost,
        AZURE_CLOUD_CONSTANTS.CO2E_PER_COST,
      )
    }
    return estimate
  }

  private getComputeFootprintEstimate(
    consumptionDetailRow: ConsumptionDetailRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const computeProcessors = this.getComputeProcessorsFromUsageType(
      consumptionDetailRow.usageType,
    )

    const computeUsage: ComputeUsage = {
      timestamp: consumptionDetailRow.timestamp,
      cpuUtilizationAverage: AZURE_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: consumptionDetailRow.vCpuHours,
      usesAverageCPUConstant: true,
    }

    const computeConstants: CloudConstants = {
      minWatts: AZURE_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
      maxWatts: AZURE_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(consumptionDetailRow),
    }

    return this.computeEstimator.estimate(
      [computeUsage],
      consumptionDetailRow.region,
      emissionsFactors,
      computeConstants,
    )[0]
  }

  private getMemoryFootprintEstimate(
    consumptionDetailRow: ConsumptionDetailRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
    withCompute: boolean,
  ): FootprintEstimate {
    const memoryUsage: MemoryUsage = {
      timestamp: consumptionDetailRow.timestamp,
      gigabyteHours: this.getUsageAmountInGigabyteHours(consumptionDetailRow),
    }

    const memoryConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(consumptionDetailRow),
    }

    const memoryEstimate = this.memoryEstimator.estimate(
      [memoryUsage],
      consumptionDetailRow.region,
      emissionsFactors,
      memoryConstants,
    )[0]

    if (memoryEstimate) {
      memoryEstimate.usesAverageCPUConstant = false
      !withCompute &&
        accumulateCo2PerCost(
          EstimateClassification.MEMORY,
          memoryEstimate.co2e,
          consumptionDetailRow.cost,
          AZURE_CLOUD_CONSTANTS.CO2E_PER_COST,
        )
    }
    return memoryEstimate
  }

  private isMemoryUsage(usageType: string) {
    return containsAny(MEMORY_USAGE_TYPES, usageType)
  }

  private isUnsupportedUsage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return containsAny(UNSUPPORTED_USAGE_TYPES, consumptionDetailRow.usageType)
  }

  private isUnknownUsage(consumptionDetailRow: ConsumptionDetailRow): boolean {
    return (
      containsAny(UNKNOWN_SERVICES, consumptionDetailRow.serviceName) ||
      containsAny(UNKNOWN_USAGE_TYPES, consumptionDetailRow.usageType) ||
      !containsAny(
        [
          ...Object.values(COMPUTE_USAGE_UNITS),
          ...Object.values(STORAGE_USAGE_UNITS),
          ...Object.values(NETWORKING_USAGE_UNITS),
          ...Object.values(MEMORY_USAGE_UNITS),
        ],
        consumptionDetailRow.usageUnit,
      )
    )
  }

  private getUsageAmountInGigabyteHours(
    consumptionDetailRow: ConsumptionDetailRow,
  ): number {
    if (consumptionDetailRow.usageUnit === MEMORY_USAGE_UNITS.GB_SECONDS_50000)
      return consumptionDetailRow.usageAmount / 3600
    return this.getGigabyteHoursFromInstanceTypeAndProcessors(
      consumptionDetailRow.usageType,
      consumptionDetailRow.usageAmount,
      consumptionDetailRow.seriesName,
    )
  }

  private getUsageAmountInTerabyteHours(
    consumptionDetailRow: ConsumptionDetailRow,
  ): number {
    if (consumptionDetailRow.usageUnit === STORAGE_USAGE_UNITS.TB_MONTH_1)
      return consumptionDetailRow.usageAmount * 24

    if (
      this.isSSDStorage(consumptionDetailRow) &&
      this.isManagedDiskStorage(consumptionDetailRow)
    ) {
      return convertGigaBytesToTerabyteHours(
        SSD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(/Disks?/, '').trim()
        ],
      )
    }

    if (
      this.isHDDStorage(consumptionDetailRow) &&
      this.isManagedDiskStorage(consumptionDetailRow)
    ) {
      return convertGigaBytesToTerabyteHours(
        HDD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(/Disks?/, '').trim()
        ],
      )
    }

    if (this.isContainerRegistryStorage(consumptionDetailRow)) {
      return convertGigaBytesToTerabyteHours(
        CONTAINER_REGISTRY_STORAGE_GB[
          consumptionDetailRow.usageType.replace(' Registry Unit', '')
        ],
      )
    }

    return convertGigaBytesToTerabyteHours(consumptionDetailRow.usageAmount)
  }

  private isSSDStorage(consumptionDetailRow: ConsumptionDetailRow): boolean {
    return (
      containsAny(
        Object.keys(SSD_MANAGED_DISKS_STORAGE_GB),
        consumptionDetailRow.usageType,
      ) || containsAny(STORAGE_USAGE_TYPES, consumptionDetailRow.usageType)
    )
  }

  private isHDDStorage(consumptionDetailRow: ConsumptionDetailRow): boolean {
    return containsAny(
      Object.keys(HDD_MANAGED_DISKS_STORAGE_GB),
      consumptionDetailRow.usageType,
    )
  }

  private isManagedDiskStorage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return containsAny(
      [
        ...Object.keys(SSD_MANAGED_DISKS_STORAGE_GB),
        ...Object.keys(HDD_MANAGED_DISKS_STORAGE_GB),
      ],
      consumptionDetailRow.usageType,
    )
  }

  private isContainerRegistryStorage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return containsAny(
      Object.keys(CONTAINER_REGISTRY_STORAGE_GB).map(
        (registryType) => `${registryType} Registry Unit`,
      ),
      consumptionDetailRow.usageType,
    )
  }

  private isNetworkingUsage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return (
      containsAny(NETWORKING_USAGE_TYPES, consumptionDetailRow.usageType) &&
      !consumptionDetailRow.usageType.includes('To Any')
    )
  }

  private getGigabytesForNetworking(
    consumptionDetailRow: ConsumptionDetailRow,
  ): number {
    if (consumptionDetailRow.usageUnit.includes('TB'))
      return convertTerabytesToGigabytes(consumptionDetailRow.usageAmount)
    return consumptionDetailRow.usageAmount
  }

  private getComputeProcessorsFromUsageType(usageType: string): string[] {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[usageType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private getGigabyteHoursFromInstanceTypeAndProcessors(
    usageType: string,
    usageAmount: number,
    seriesName: string,
  ): number {
    // if the usage type is a memory usage type, grab the
    // gigabyte hours from the cache name or the usage amount
    if (MEMORY_USAGE_TYPES.includes(usageType)) {
      if (usageType.includes('Cache'))
        return this.getGigabyteHoursFromCacheName(usageType, usageAmount)
      return usageAmount
    }

    // grab the instance type memory from the virtual machine mappings list
    const instanceTypeMemory =
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName]?.[usageType]?.[1]

    // check to see if the instance type is contained in the virtual machine mapping list
    // or if there is memory associated with it, otherwise return void
    const { isValidInstanceType } = this.checkInstanceTypes(seriesName)
    if (!isValidInstanceType || !instanceTypeMemory) return

    // grab the list of processors per instance type
    // and then the Azure specific memory constant for the processors
    const processors = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[usageType] || [
      COMPUTE_PROCESSOR_TYPES.UNKNOWN,
    ]
    const processorMemory = AZURE_CLOUD_CONSTANTS.getMemory(processors)

    // grab the entire instance series that the instance type is classified within
    const seriesInstanceTypes: number[][] = Object.values(
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName],
    )

    // grab the vcpu and memory (gb) from the largest instance type in the family
    const [largestInstanceTypevCpus, largestInstanceTypeMemory] =
      seriesInstanceTypes[seriesInstanceTypes.length - 1]

    return calculateGigabyteHours(
      getPhysicalChips(largestInstanceTypevCpus),
      largestInstanceTypeMemory,
      processorMemory,
      instanceTypeMemory,
      usageAmount,
    )
  }

  private getGigabyteHoursFromCacheName(
    usageType: string,
    usageAmount: number,
  ) {
    const cacheName = usageType.split(' ')[0]
    return CACHE_MEMORY_GB[cacheName] * usageAmount
  }

  private checkInstanceTypes(seriesName: string) {
    // a valid instance type is one that is mapped in the VirtualMachineTypes lists
    const isValidInstanceType = Object.keys(
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
    ).includes(seriesName)
    return { isValidInstanceType }
  }

  private getReplicationFactor(usageRow: ConsumptionDetailRow): number {
    return (
      AZURE_REPLICATION_FACTORS_FOR_SERVICES[usageRow.serviceName] &&
      AZURE_REPLICATION_FACTORS_FOR_SERVICES[usageRow.serviceName](
        usageRow.usageType,
        usageRow.region,
      )
    )
  }

  private getEstimateForUnknownUsage(
    rowData: ConsumptionDetailRow,
  ): FootprintEstimate {
    const unknownUsage: UnknownUsage = {
      timestamp: rowData.timestamp,
      cost: rowData.cost,
      usageUnit: rowData.usageUnit,
      reclassificationType: this.getClassification(rowData.usageUnit),
    }
    const unknownConstants: CloudConstants = {
      co2ePerCost: AZURE_CLOUD_CONSTANTS.CO2E_PER_COST,
    }
    return this.unknownEstimator.estimate(
      [unknownUsage],
      rowData.region,
      AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      unknownConstants,
    )[0]
  }

  private getClassification(usageUnit: string) {
    return UNKNOWN_USAGE_TO_ASSUMED_USAGE_MAPPING[usageUnit]?.[0]
      ? UNKNOWN_USAGE_TO_ASSUMED_USAGE_MAPPING[usageUnit][0]
      : EstimateClassification.UNKNOWN
  }
}
