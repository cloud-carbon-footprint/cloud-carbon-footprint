import { DatasourceFactory } from '../datasources/DatasourceFactory'
import { FootprintEstimatorFactory } from '../domain/FootprintEstimatorFactory'

import { EstimationRequest } from './EstimationRequest'
import { EstimationResult } from './EstimationResult'
import FootprintEstimate from '../domain/FootprintEstimate'

export class App {
  async getEstimate(estimationRequest: EstimationRequest): Promise<EstimationResult[]> {
    if (estimationRequest.startDate > estimationRequest.endDate) throw 'startDate cannot be greater than endDate'
    if (!estimationRequest.startDate) throw 'startDate cannot be undefined'
    if (!estimationRequest.endDate) throw 'endDate cannot be undefined'

    const ebsDatasource = DatasourceFactory.create()
    const storageUsage = await ebsDatasource.getUsage(estimationRequest.startDate, estimationRequest.endDate)

    const ebsFootPrintEstimator = FootprintEstimatorFactory.create()
    const ebsStorageEstimates = ebsFootPrintEstimator.estimate(storageUsage)

    return ebsStorageEstimates.map((estimate: FootprintEstimate) => {
      return {
        timestamp: estimate.timestamp,
        estimates: [
          {
            serviceName: 'ebs',
            wattHours: estimate.wattHours,
            co2e: estimate.co2e,
          },
        ],
      }
    })
  }
}
