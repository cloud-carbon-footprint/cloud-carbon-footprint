/*
 * © 2021 Thoughtworks, Inc.
 */
import moment, { unitOfTime } from 'moment'
import {
  ConsumptionManagementClient,
  UsageDetailUnion,
} from '@azure/arm-consumption'
import { PagedAsyncIterableIterator } from '@azure/core-paging'
import {
  containsAny,
  convertGigaBytesToTerabyteHours,
  convertTerabytesToGigabytes,
  EstimationResult,
  GroupBy,
  Logger,
  LookupTableInput,
  LookupTableOutput,
  wait,
} from '@cloud-carbon-footprint/common'
import {
  accumulateKilowattHours,
  AccumulateKilowattHoursBy,
  appendOrAccumulateEstimatesByDay,
  calculateGigabyteHours,
  CloudConstants,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  ComputeUsage,
  EmbodiedEmissionsEstimator,
  EmbodiedEmissionsUsage,
  FootprintEstimate,
  getPhysicalChips,
  MemoryEstimator,
  MemoryUsage,
  MutableEstimationResult,
  NetworkingEstimator,
  NetworkingUsage,
  StorageEstimator,
  StorageUsage,
  UnknownEstimator,
  UnknownUsage,
} from '@cloud-carbon-footprint/core'

import ConsumptionDetailRow from './ConsumptionDetailRow'
import {
  GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING,
  GPU_VIRTUAL_MACHINE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING,
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
} from './VirtualMachineTypes'
import {
  AZURE_QUERY_GROUP_BY,
  CACHE_MEMORY_GB,
  COMPUTE_USAGE_UNITS,
  CONTAINER_REGISTRY_STORAGE_GB,
  HDD_MANAGED_DISKS_STORAGE_GB,
  MEMORY_USAGE_TYPES,
  MEMORY_USAGE_UNITS,
  NETWORKING_USAGE_TYPES,
  NETWORKING_USAGE_UNITS,
  SSD_MANAGED_DISKS_STORAGE_GB,
  STORAGE_USAGE_TYPES,
  STORAGE_USAGE_UNITS,
  TenantHeaders,
  UNKNOWN_SERVICES,
  UNKNOWN_USAGE_TYPES,
  UNSUPPORTED_USAGE_TYPES,
  UsageDetailResult,
  UsageRowPageErrorResponse,
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
    private readonly embodiedEmissionsEstimator: EmbodiedEmissionsEstimator,
    private readonly consumptionManagementClient?: ConsumptionManagementClient,
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
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    const usageRows = await this.getConsumptionUsageDetails(startDate, endDate)
    const results: MutableEstimationResult[] = []
    const unknownRows: ConsumptionDetailRow[] = []

    usageRows
      .filter(
        (consumptionRow) =>
          new Date(consumptionRow.properties.date) >= startDate &&
          new Date(consumptionRow.properties.date) <= endDate,
      )
      .map((consumptionRow) => {
        const consumptionDetailRow: ConsumptionDetailRow =
          new ConsumptionDetailRow(consumptionRow)

        this.updateTimestampByGrouping(grouping, consumptionDetailRow)

        const footprintEstimate = this.getFootprintEstimateFromUsageRow(
          consumptionDetailRow,
          unknownRows,
        )

        if (footprintEstimate) {
          appendOrAccumulateEstimatesByDay(
            results,
            consumptionDetailRow,
            footprintEstimate,
            grouping,
            [],
          )
        }
        return []
      })

    if (results.length > 0) {
      unknownRows.map((rowData: ConsumptionDetailRow) => {
        const footprintEstimate = this.getEstimateForUnknownUsage(rowData)
        if (footprintEstimate)
          appendOrAccumulateEstimatesByDay(
            results,
            rowData,
            footprintEstimate,
            grouping,
            [],
          )
      })
    }

    return results
  }

  public getEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const result: LookupTableOutput[] = []
    const unknownRows: ConsumptionDetailRow[] = []

    inputData.map((inputDataRow: LookupTableInput) => {
      const usageRow = {
        id: '',
        name: '',
        type: '',
        tags: {},
        kind: 'legacy' as const,
        properties: {
          kind: 'legacy' as const,
          date: new Date(''),
          quantity: 1,
          cost: 1,
          meterDetails: {
            meterName: inputDataRow.usageType,
            unitOfMeasure: inputDataRow.usageUnit,
            meterCategory: inputDataRow.serviceName,
          },
          subscriptionName: '',
          resourceLocation: inputDataRow.region,
        },
      }

      const consumptionDetailRow = new ConsumptionDetailRow(usageRow)
      const footprintEstimate = this.getFootprintEstimateFromUsageRow(
        consumptionDetailRow,
        unknownRows,
      )

      if (footprintEstimate) {
        result.push({
          serviceName: inputDataRow.serviceName,
          region: inputDataRow.region,
          usageType: inputDataRow.usageType,
          kilowattHours: footprintEstimate.kilowattHours,
          co2e: footprintEstimate.co2e,
        })
      }
    })

    if (result.length > 0) {
      unknownRows.map((inputDataRow: ConsumptionDetailRow) => {
        const footprintEstimate = this.getEstimateForUnknownUsage(inputDataRow)
        if (footprintEstimate) {
          result.push({
            serviceName: inputDataRow.serviceName,
            region: inputDataRow.region,
            usageType: inputDataRow.usageType,
            kilowattHours: footprintEstimate.kilowattHours,
            co2e: footprintEstimate.co2e,
          })
        }
      })
    }

    return result
  }

  private getFootprintEstimateFromUsageRow(
    consumptionDetailRow: ConsumptionDetailRow,
    unknownRows: ConsumptionDetailRow[],
  ): FootprintEstimate | void {
    if (!this.isUnsupportedUsage(consumptionDetailRow)) {
      if (this.isUnknownUsage(consumptionDetailRow)) {
        unknownRows.push(consumptionDetailRow)
      } else {
        return this.getEstimateByPricingUnit(consumptionDetailRow)
      }
    }
  }

  private updateTimestampByGrouping(
    grouping: GroupBy,
    consumptionDetailRow: ConsumptionDetailRow,
  ): void {
    const startOfType: string = AZURE_QUERY_GROUP_BY[grouping]
    const firstDayOfGrouping = moment
      .utc(consumptionDetailRow.timestamp)
      .startOf(startOfType as unitOfTime.StartOf)
    consumptionDetailRow.timestamp = new Date(firstDayOfGrouping.toISOString())
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getConsumptionTenantValue(
    e: UsageRowPageErrorResponse,
    type: 'retry' | 'remaining',
  ) {
    const tenantHeaders: TenantHeaders = {
      retry: this.consumptionManagementRetryAfterHeader,
      remaining: this.consumptionManagementRateLimitRemainingHeader,
    }
    return e.response.headers._headersMap.get(tenantHeaders[type])?.value
  }

  private async waitIfRateLimitExceeded(
    errorResponse: UsageRowPageErrorResponse,
    errorMsg: string,
  ) {
    // check to see if error is from exceeding the rate limit and grab retry time value
    const retryAfterValue = this.getConsumptionTenantValue(
      errorResponse,
      'retry',
    )
    const rateLimitRemainingValue = this.getConsumptionTenantValue(
      errorResponse,
      'remaining',
    )
    if (rateLimitRemainingValue == 0) {
      this.consumptionManagementLogger.warn(
        `${errorMsg} ${errorResponse.message}`,
      )
      this.consumptionManagementLogger.info(
        `Retrying after ${retryAfterValue} seconds`,
      )
      await wait(retryAfterValue * 1000)
    } else {
      throw new Error(`${errorMsg} ${errorResponse.message}`)
    }
  }

  private async pageThroughUsageRows(
    usageRows: PagedAsyncIterableIterator<UsageDetailUnion>,
  ): Promise<Array<UsageDetailResult>> {
    const usageRowDetails: Array<UsageDetailResult> = []
    let currentRow
    let hasNextPage = true
    try {
      while (hasNextPage) {
        currentRow = await usageRows.next()
        if (currentRow?.value) {
          usageRowDetails.push(currentRow.value as UsageDetailResult)
        }
        hasNextPage = !currentRow.done
      }
    } catch (error) {
      throw error
    }
    return usageRowDetails
  }

  private async getConsumptionUsageDetails(
    startDate: Date,
    endDate: Date,
    retry = false,
  ): Promise<Array<UsageDetailResult>> {
    try {
      const options = {
        expand: 'properties/meterDetails',
        filter: `properties/usageStart ge '${startDate.toISOString()}' AND properties/usageEnd le '${endDate.toISOString()}'`,
      }
      const usageRows = this.consumptionManagementClient.usageDetails.list(
        `/subscriptions/${this.consumptionManagementClient.subscriptionId}/`,
        options,
      )
      const usageRowDetails = await this.pageThroughUsageRows(usageRows)
      if (retry) {
        this.consumptionManagementLogger.info(
          'Retry Successful! Continuing grabbing estimates...',
        )
      }
      return usageRowDetails
    } catch (e) {
      const errorMsg =
        'Azure ConsumptionManagementClient UsageDetailRow paging failed. Reason:'
      await this.waitIfRateLimitExceeded(e, errorMsg)
      retry = true
      return this.getConsumptionUsageDetails(startDate, endDate, retry)
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
      case COMPUTE_USAGE_UNITS.HOUR_10:
      case COMPUTE_USAGE_UNITS.HOURS_10:
      case COMPUTE_USAGE_UNITS.HOUR_100:
      case COMPUTE_USAGE_UNITS.HOURS_100:
      case COMPUTE_USAGE_UNITS.HOUR_1000:
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

        const embodiedEmissions = this.getEmbodiedEmissions(
          consumptionDetailRow,
          emissionsFactors,
        )

        // if memory usage, only return the memory footprint
        if (this.isMemoryUsage(consumptionDetailRow.usageType)) {
          return memoryFootprint
        }

        // if there exist any kilowatt hours from a memory footprint,
        // add the kwh and co2e for both compute and memory
        if (memoryFootprint.kilowattHours || embodiedEmissions.co2e) {
          const kilowattHours =
            computeFootprint.kilowattHours +
            memoryFootprint.kilowattHours +
            embodiedEmissions.kilowattHours
          accumulateKilowattHours(
            AZURE_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
            consumptionDetailRow,
            kilowattHours,
            AccumulateKilowattHoursBy.USAGE_AMOUNT,
          )

          return {
            timestamp: memoryFootprint.timestamp,
            kilowattHours: kilowattHours,
            co2e:
              computeFootprint.co2e +
              memoryFootprint.co2e +
              embodiedEmissions.co2e,
            usesAverageCPUConstant: computeFootprint.usesAverageCPUConstant,
          }
        }

        if (computeFootprint)
          accumulateKilowattHours(
            AZURE_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
            consumptionDetailRow,
            computeFootprint.kilowattHours,
            AccumulateKilowattHoursBy.USAGE_AMOUNT,
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
        return {
          timestamp: new Date(),
          kilowattHours: 0,
          co2e: 0,
          usesAverageCPUConstant: false,
        }
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
      accumulateKilowattHours(
        AZURE_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        consumptionDetailRow,
        networkingEstimate.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
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
      accumulateKilowattHours(
        AZURE_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        consumptionDetailRow,
        estimate.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
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
      vCpuHours: consumptionDetailRow.vCpuHours,
      usesAverageCPUConstant: true,
    }

    const computeConstants: CloudConstants = {
      minWatts: AZURE_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
      maxWatts: AZURE_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(consumptionDetailRow),
    }

    const computeFootprintEstimate = this.computeEstimator.estimate(
      [computeUsage],
      consumptionDetailRow.region,
      emissionsFactors,
      computeConstants,
    )[0]

    if (this.isGpuUsage(consumptionDetailRow.usageType)) {
      return this.appendGpuComputeEstimate(
        consumptionDetailRow,
        powerUsageEffectiveness,
        emissionsFactors,
        computeFootprintEstimate,
      )
    }

    return computeFootprintEstimate
  }

  private appendGpuComputeEstimate(
    consumptionDetailRow: ConsumptionDetailRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
    computeFootprintEstimate: FootprintEstimate,
  ) {
    const gpuComputeProcessors = this.getGpuComputeProcessorsFromUsageType(
      consumptionDetailRow.usageType,
    )

    const gpuComputeUsage: ComputeUsage = {
      timestamp: consumptionDetailRow.timestamp,
      cpuUtilizationAverage: AZURE_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: consumptionDetailRow.gpuHours,
      usesAverageCPUConstant: true,
    }

    const gpuComputeConstants: CloudConstants = {
      minWatts: AZURE_CLOUD_CONSTANTS.getMinWatts(gpuComputeProcessors),
      maxWatts: AZURE_CLOUD_CONSTANTS.getMaxWatts(gpuComputeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(consumptionDetailRow),
    }

    const gpuComputeFootprintEstimate = this.computeEstimator.estimate(
      [gpuComputeUsage],
      consumptionDetailRow.region,
      emissionsFactors,
      gpuComputeConstants,
    )[0]

    computeFootprintEstimate.kilowattHours +=
      gpuComputeFootprintEstimate.kilowattHours
    computeFootprintEstimate.co2e += gpuComputeFootprintEstimate.co2e
    return computeFootprintEstimate
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
        accumulateKilowattHours(
          AZURE_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
          consumptionDetailRow,
          memoryEstimate.kilowattHours,
          AccumulateKilowattHoursBy.USAGE_AMOUNT,
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

  private isGpuUsage(usageType: string): boolean {
    return containsAny(Object.keys(GPU_VIRTUAL_MACHINE_TYPES), usageType)
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
      // Extract disk type according to pattern of Managed SSD names
      const matchingDiskType =
        consumptionDetailRow.usageType.match(/(P|E)\d{1,2}/)[0]
      return convertGigaBytesToTerabyteHours(
        SSD_MANAGED_DISKS_STORAGE_GB[matchingDiskType],
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

  private getGpuComputeProcessorsFromUsageType(usageType: string): string[] {
    return (
      GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING[usageType] || [
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
    if (!isValidInstanceType || !instanceTypeMemory) return 0

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
      usageAmount: rowData.usageAmount,
      usageUnit: rowData.usageUnit,
    }

    const unknownConstants: CloudConstants = {
      kilowattHoursByServiceAndUsageUnit:
        AZURE_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
    }
    return this.unknownEstimator.estimate(
      [unknownUsage],
      rowData.region,
      AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      unknownConstants,
    )[0]
  }

  private getEmbodiedEmissions(
    consumptionDetailRow: ConsumptionDetailRow,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ) {
    const { instancevCpu, scopeThreeEmissions, largestInstancevCpu } =
      this.getDataFromSeriesNameAndUsageType(
        consumptionDetailRow.seriesName,
        consumptionDetailRow.usageType,
      )

    if (!instancevCpu || !scopeThreeEmissions || !largestInstancevCpu)
      return {
        timestamp: new Date(),
        kilowattHours: 0,
        co2e: 0,
      }

    const embodiedEmissionsUsage: EmbodiedEmissionsUsage = {
      instancevCpu,
      largestInstancevCpu,
      usageTimePeriod: consumptionDetailRow.usageAmount / instancevCpu,
      scopeThreeEmissions,
    }

    return this.embodiedEmissionsEstimator.estimate(
      [embodiedEmissionsUsage],
      consumptionDetailRow.region,
      emissionsFactors,
    )[0]
  }

  private getDataFromSeriesNameAndUsageType(
    seriesName: string,
    usageType: string,
  ): {
    [key: string]: number
  } {
    const instancevCpu =
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName]?.[usageType]?.[0] ||
      VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING[usageType]?.[0]

    const scopeThreeEmissions =
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName]?.[usageType]?.[2] ||
      VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING[usageType]?.[3]

    let largestInstancevCpu
    if (seriesName) {
      // grab the entire instance series that the instance type is classified within
      const seriesInstanceTypes: number[][] = Object.values(
        VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName],
      )

      // grab the vcpu from the largest instance type in the family
      ;[largestInstancevCpu] =
        seriesInstanceTypes[seriesInstanceTypes.length - 1]
    } else {
      largestInstancevCpu =
        VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING[usageType]?.[2]
    }

    return {
      instancevCpu,
      scopeThreeEmissions,
      largestInstancevCpu,
    }
  }
}
