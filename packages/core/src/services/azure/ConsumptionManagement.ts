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
  COMPUTE_USAGE_TYPES,
  HDD_MANAGED_DISKS_STORAGE_GB,
  SSD_MANAGED_DISKS_STORAGE_GB,
  STORAGE_USAGE_TYPES,
  UNSUPPORTED_SERVICES,
} from './ConsumptionTypes'
import StorageUsage from '../../domain/StorageUsage'

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
      case COMPUTE_USAGE_TYPES.HOUR_1:
      case COMPUTE_USAGE_TYPES.HOURS_10:
      case COMPUTE_USAGE_TYPES.HOURS_100:
      case COMPUTE_USAGE_TYPES.HOURS_1000:
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
      case STORAGE_USAGE_TYPES.MONTH_1:
        const usageAmountTerabyteHours = this.getUsageAmountInTerabyteHours(
          consumptionDetailRow,
        )
        const storageUsage: StorageUsage = {
          timestamp: consumptionDetailRow.timestamp,
          terabyteHours: usageAmountTerabyteHours,
        }
        let estimate: FootprintEstimate
        if (this.usageTypeIsSSDStorage(consumptionDetailRow)) {
          estimate = this.ssdStorageEstimator.estimate(
            [storageUsage],
            consumptionDetailRow.region,
            'AZURE',
          )[0]
        } else if (this.usageTypeIsHDDStorage(consumptionDetailRow)) {
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
    if (this.usageTypeIsSSDStorage(consumptionDetailRow)) {
      return this.convertGigaBytesToTerabyteHours(
        SSD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(' Disks', '')
        ],
      )
    }

    if (this.usageTypeIsHDDStorage(consumptionDetailRow)) {
      return this.convertGigaBytesToTerabyteHours(
        HDD_MANAGED_DISKS_STORAGE_GB[
          consumptionDetailRow.usageType.replace(' Disks', '')
        ],
      )
    }
  }

  private usageTypeIsSSDStorage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return this.containsAny(
      Object.keys(SSD_MANAGED_DISKS_STORAGE_GB),
      consumptionDetailRow.usageType,
    )
  }
  private usageTypeIsHDDStorage(
    consumptionDetailRow: ConsumptionDetailRow,
  ): boolean {
    return this.containsAny(
      Object.keys(HDD_MANAGED_DISKS_STORAGE_GB),
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
