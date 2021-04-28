/*
 * © 2021 ThoughtWorks, Inc.
 */
import moment, { unitOfTime } from 'moment'
import {
  UsageDetail,
  UsageDetailsListResult,
} from '@azure/arm-consumption/esm/models'
import { ConsumptionManagementClient } from '@azure/arm-consumption'
import ComputeEstimator from '../../domain/ComputeEstimator'
import { StorageEstimator } from '../../domain/StorageEstimator'
import NetworkingEstimator from '../../domain/NetworkingEstimator'
import { EstimationResult } from '../../application'
import ComputeUsage from '../../domain/ComputeUsage'
import { CLOUD_CONSTANTS } from '../../domain/FootprintEstimationConstants'
import FootprintEstimate, {
  appendOrAccumulateEstimatesByDay,
  MutableEstimationResult,
} from '../../domain/FootprintEstimate'
import ConsumptionDetailRow from './ConsumptionDetailRow'
import { INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING } from './VirtualMachineTypes'
import {
  COMPUTE_USAGE_UNITS,
  CONTAINER_REGISTRY_STORAGE_GB,
  HDD_MANAGED_DISKS_STORAGE_GB,
  NETWORKING_USAGE_TYPES,
  NETWORKING_USAGE_UNITS,
  SSD_MANAGED_DISKS_STORAGE_GB,
  STORAGE_USAGE_TYPES,
  STORAGE_USAGE_UNITS,
  UNSUPPORTED_SERVICES,
  UNSUPPORTED_USAGE_TYPES,
  AZURE_QUERY_GROUP_BY,
} from './ConsumptionTypes'
import StorageUsage from '../../domain/StorageUsage'
import NetworkingUsage from '../../domain/NetworkingUsage'
import { COMPUTE_PROCESSOR_TYPES } from '../../domain/ComputeProcessorTypes'
import Logger from '../Logger'
import configLoader from '../../application/ConfigLoader'

type TenantHeaders = {
  [key: string]: string
}

export default class ConsumptionManagementService {
  private readonly consumptionManagementLogger: Logger
  private readonly consumptionManagementRateLimitRemainingHeader: string
  private readonly consumptionManagementRetryAfterHeader: string
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
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

    allUsageRows.map((consumptionRow: UsageDetail) => {
      const consumptionDetailRow: ConsumptionDetailRow = new ConsumptionDetailRow(
        consumptionRow,
      )

      this.updateTimestampByWeek(consumptionDetailRow)

      if (this.isUnsupportedUsage(consumptionDetailRow)) return []

      const footprintEstimate = this.getEstimateByPricingUnit(
        consumptionDetailRow,
      )

      if (footprintEstimate) {
        appendOrAccumulateEstimatesByDay(
          results,
          consumptionDetailRow,
          footprintEstimate,
        )
      }
    })
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
        const nextUsageRows = await this.consumptionManagementClient.usageDetails.listNext(
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
          await this.wait(retryAfterValue * 1000)
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

  private async wait(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms)
    })
  }

  private async getConsumptionUsageDetails(startDate: Date, endDate: Date) {
    try {
      const options = {
        expand: 'properties/meterDetails',
        filter: `properties/usageStart ge '${startDate.toISOString()}' AND properties/usageEnd le '${endDate.toISOString()}'`,
      }
      return await this.consumptionManagementClient.usageDetails.list(options)
    } catch (e) {
      throw new Error(
        `Azure ConsumptionManagementClient.usageDetails.list failed. Reason: ${e.message}`,
      )
    }
  }

  private getEstimateByPricingUnit(
    consumptionDetailRow: ConsumptionDetailRow,
  ): FootprintEstimate {
    switch (consumptionDetailRow.usageUnit) {
      case COMPUTE_USAGE_UNITS.HOUR_1:
      case COMPUTE_USAGE_UNITS.HOURS_10:
      case COMPUTE_USAGE_UNITS.HOURS_100:
      case COMPUTE_USAGE_UNITS.HOURS_1000:
        const computeUsage: ComputeUsage = {
          cpuUtilizationAverage: CLOUD_CONSTANTS.AZURE.AVG_CPU_UTILIZATION_2020,
          numberOfvCpus: consumptionDetailRow.vCpuHours,
          usesAverageCPUConstant: true,
          timestamp: consumptionDetailRow.timestamp,
        }
        const computeProcessors = this.getComputeProcessorsFromUsageType(
          consumptionDetailRow.usageType,
        )

        return this.computeEstimator.estimate(
          [computeUsage],
          consumptionDetailRow.region,
          'AZURE',
          computeProcessors,
        )[0]
      case STORAGE_USAGE_UNITS.MONTH_1:
      case STORAGE_USAGE_UNITS.MONTH_100:
      case STORAGE_USAGE_UNITS.GB_MONTH_10:
      case STORAGE_USAGE_UNITS.GB_MONTH_100:
      case STORAGE_USAGE_UNITS.DAY_30:
      case STORAGE_USAGE_UNITS.TB_MONTH_1:
        const usageAmountTerabyteHours = this.getUsageAmountInTerabyteHours(
          consumptionDetailRow,
        )
        const storageUsage: StorageUsage = {
          timestamp: consumptionDetailRow.timestamp,
          terabyteHours: usageAmountTerabyteHours,
        }
        let estimate: FootprintEstimate
        if (this.isSSDStorage(consumptionDetailRow)) {
          estimate = this.ssdStorageEstimator.estimate(
            [storageUsage],
            consumptionDetailRow.region,
            'AZURE',
          )[0]
        } else if (this.isHDDStorage(consumptionDetailRow)) {
          estimate = this.hddStorageEstimator.estimate(
            [storageUsage],
            consumptionDetailRow.region,
            'AZURE',
          )[0]
        } else {
          this.consumptionManagementLogger.warn(
            `Unexpected usage type for storage service: ${consumptionDetailRow.usageType}`,
          )
        }
        if (estimate) estimate.usesAverageCPUConstant = false
        return estimate
      case NETWORKING_USAGE_UNITS.GB_1:
      case NETWORKING_USAGE_UNITS.GB_10:
      case NETWORKING_USAGE_UNITS.GB_100:
      case NETWORKING_USAGE_UNITS.GB_200:
      case NETWORKING_USAGE_UNITS.TB_1:
        if (this.isNetworkingUsage(consumptionDetailRow)) {
          const networkingUsage: NetworkingUsage = {
            timestamp: consumptionDetailRow.timestamp,
            gigabytes: this.getGigabytesForNetworking(consumptionDetailRow),
          }

          const networkingEstimate = this.networkingEstimator.estimate(
            [networkingUsage],
            consumptionDetailRow.region,
            'AZURE',
          )[0]
          if (networkingEstimate)
            networkingEstimate.usesAverageCPUConstant = false
          return networkingEstimate
        }
        break
      default:
        this.consumptionManagementLogger.warn(
          `Unsupported usage unit: ${consumptionDetailRow.usageUnit}`,
        )
    }
  }

  private isUnsupportedUsage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return (
      this.containsAny(
        UNSUPPORTED_SERVICES,
        consumptionDetailRow.serviceName,
      ) ||
      this.containsAny(
        UNSUPPORTED_USAGE_TYPES,
        consumptionDetailRow.usageType,
      ) ||
      !this.containsAny(
        [
          ...Object.values(COMPUTE_USAGE_UNITS),
          ...Object.values(STORAGE_USAGE_UNITS),
          ...Object.values(NETWORKING_USAGE_UNITS),
        ],
        consumptionDetailRow.usageUnit,
      )
    )
  }

  private containsAny(substrings: string[], stringToSearch: string): boolean {
    return substrings.some((substring) =>
      new RegExp(`\\b${substring}\\b`).test(stringToSearch),
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
      return this.convertGigaBytesToTerabyteHours(
        SSD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(/Disks?/, '').trim()
        ],
      )
    }

    if (
      this.isHDDStorage(consumptionDetailRow) &&
      this.isManagedDiskStorage(consumptionDetailRow)
    ) {
      return this.convertGigaBytesToTerabyteHours(
        HDD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(/Disks?/, '').trim()
        ],
      )
    }

    if (this.isContainerRegistryStorage(consumptionDetailRow)) {
      return this.convertGigaBytesToTerabyteHours(
        CONTAINER_REGISTRY_STORAGE_GB[
          consumptionDetailRow.usageType.replace(' Registry Unit', '')
        ],
      )
    }

    return this.convertGigaBytesToTerabyteHours(
      consumptionDetailRow.usageAmount,
    )
  }

  private isSSDStorage(consumptionDetailRow: ConsumptionDetailRow): boolean {
    return (
      this.containsAny(
        Object.keys(SSD_MANAGED_DISKS_STORAGE_GB),
        consumptionDetailRow.usageType,
      ) || this.containsAny(STORAGE_USAGE_TYPES, consumptionDetailRow.usageType)
    )
  }

  private isHDDStorage(consumptionDetailRow: ConsumptionDetailRow): boolean {
    return this.containsAny(
      Object.keys(HDD_MANAGED_DISKS_STORAGE_GB),
      consumptionDetailRow.usageType,
    )
  }

  private isManagedDiskStorage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return this.containsAny(
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
    return this.containsAny(
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
      this.containsAny(
        NETWORKING_USAGE_TYPES,
        consumptionDetailRow.usageType,
      ) && !consumptionDetailRow.usageType.includes('To Any')
    )
  }

  private getGigabytesForNetworking(
    consumptionDetailRow: ConsumptionDetailRow,
  ): number {
    if (consumptionDetailRow.usageUnit.includes('TB'))
      return this.convertTerabytesToGigabytes(consumptionDetailRow.usageAmount)
    return consumptionDetailRow.usageAmount
  }

  private convertTerabytesToGigabytes(terabytes: number): number {
    return terabytes * 1000
  }

  private convertGigaBytesToTerabyteHours(gigaBytes: number): number {
    return (gigaBytes / 1000) * 24
  }

  private getComputeProcessorsFromUsageType(usageType: string): string[] {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[usageType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }
}
