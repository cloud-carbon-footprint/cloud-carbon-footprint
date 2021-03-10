/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import ComputeEstimator from '../../domain/ComputeEstimator'
import { StorageEstimator } from '../../domain/StorageEstimator'
import NetworkingEstimator from '../../domain/NetworkingEstimator'
import ServiceWrapper from '../azure/ServiceWrapper'
import { EstimationResult } from '../../application'
import ComputeUsage from '../../domain/ComputeUsage'
import { CLOUD_CONSTANTS } from '../../domain/FootprintEstimationConstants'
import FootprintEstimate, {
  appendOrAccumulateEstimatesByDay,
  MutableEstimationResult,
} from '../../domain/FootprintEstimate'
import { UsageDetail } from '@azure/arm-consumption/esm/models'
import ConsumptionDetailRow from './ConsumptionDetailRow'

export default class ConsumptionManagementService {
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly serviceWrapper: ServiceWrapper,
  ) {}

  async getEstimates(
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const options = {
      expand: 'properties/meterDetails',
      filter: `properties/usageStart ge '${startDate}' AND properties/usageEnd le '${endDate}'`,
    }

    const usageRows = await this.serviceWrapper.getConsumptionManagementResults(
      options,
    )

    const results: MutableEstimationResult[] = []

    usageRows.map((consumptionRow: UsageDetail) => {
      const consumptionDetailRow: ConsumptionDetailRow = new ConsumptionDetailRow(
        consumptionRow,
      )

      let footprintEstimate: FootprintEstimate
      switch (consumptionDetailRow.usageUnit) {
        case '10 Hours':
          const computeUsage: ComputeUsage = {
            cpuUtilizationAverage: CLOUD_CONSTANTS.GCP.AVG_CPU_UTILIZATION_2020,
            numberOfvCpus: consumptionDetailRow.vCpuHours,
            usesAverageCPUConstant: true,
            timestamp: consumptionDetailRow.timestamp,
          }
          footprintEstimate = this.computeEstimator.estimate(
            [computeUsage],
            consumptionDetailRow.region,
            'AZURE',
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
}
