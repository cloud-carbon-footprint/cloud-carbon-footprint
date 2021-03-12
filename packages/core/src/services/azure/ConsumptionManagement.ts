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

      let footprintEstimate: FootprintEstimate
      switch (consumptionDetailRow.usageUnit) {
        case '1 Hour':
        case '10 Hours':
          const computeUsage: ComputeUsage = {
            cpuUtilizationAverage:
              CLOUD_CONSTANTS.AZURE.AVG_CPU_UTILIZATION_2020,
            numberOfvCpus: consumptionDetailRow.vCpuHours,
            usesAverageCPUConstant: true,
            timestamp: consumptionDetailRow.timestamp,
          }
          const computeProcessors = this.getComputeProcessorsFromUsageType(
            consumptionDetailRow.usageType,
          )

          footprintEstimate = this.computeEstimator.estimate(
            [computeUsage],
            consumptionDetailRow.region,
            'AZURE',
            computeProcessors,
          )[0]
      }
      appendOrAccumulateEstimatesByDay(
        results,
        consumptionDetailRow,
        footprintEstimate,
      )
    })
    return results
  }

  private getComputeProcessorsFromUsageType(usageType: string): string[] {
    return INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[usageType]
  }
}
