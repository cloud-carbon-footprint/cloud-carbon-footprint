/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { UsageDetail } from '@azure/arm-consumption/esm/models'
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
  HDD_MANAGED_DISKS_STORAGE_GB,
  SSD_MANAGED_DISKS_STORAGE_GB,
  STORAGE_USAGE_TYPES,
  STORAGE_USAGE_UNITS,
  UNSUPPORTED_SERVICES,
} from './ConsumptionTypes'
import StorageUsage from '../../domain/StorageUsage'
import moment from 'moment'

export default class ConsumptionManagementService {
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly consumptionManagementClient: ConsumptionManagementClient,
  ) {}

  public async getEstimates(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const options = {
      expand: 'properties/meterDetails',
      filter: `properties/usageStart ge '${startDate}' AND properties/usageEnd le '${endDate}'`,
    }

    const usageRows = await this.consumptionManagementClient.usageDetails.list(
      options,
    )

    const results: MutableEstimationResult[] = []

    usageRows.map((consumptionRow: UsageDetail) => {
      const consumptionDetailRow: ConsumptionDetailRow = new ConsumptionDetailRow(
        consumptionRow,
      )

      if (this.isUnsupportedUsage(consumptionDetailRow.serviceName)) return []

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
        }
        if (estimate) estimate.usesAverageCPUConstant = false
        return estimate
    }
  }

  private isUnsupportedUsage(serviceName: string): boolean {
    return this.containsAny(UNSUPPORTED_SERVICES, serviceName)
  }

  private containsAny(substrings: string[], stringToSearch: string): boolean {
    return substrings.some((substring) =>
      new RegExp(`\\b${substring}\\b`).test(stringToSearch),
    )
  }

  private getUsageAmountInTerabyteHours(
    consumptionDetailRow: ConsumptionDetailRow,
  ): number {
    if (
      this.isSSDStorage(consumptionDetailRow) &&
      this.isManagedDiskStorage(consumptionDetailRow)
    ) {
      return this.convertGigaBytesToTerabyteHours(
        SSD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(' Disks', '')
        ],
      )
    }

    if (
      this.isHDDStorage(consumptionDetailRow) &&
      this.isManagedDiskStorage(consumptionDetailRow)
    ) {
      return this.convertGigaBytesToTerabyteHours(
        HDD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(' Disks', '')
        ],
      )
    }

    // Convert Gb-Month to Terabyte Hours
    const daysInMonth = moment(consumptionDetailRow.timestamp).daysInMonth()
    return (consumptionDetailRow.usageAmount / 1000) * (24 * daysInMonth)
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

  private convertGigaBytesToTerabyteHours(gigaBytes: number): number {
    return (gigaBytes / 1000) * 24
  }

  private getComputeProcessorsFromUsageType(usageType: string): string[] {
    return INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[usageType]
  }
}
