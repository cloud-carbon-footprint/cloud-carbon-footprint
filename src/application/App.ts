import { DatasourceFactory } from '../datasources/DatasourceFactory'
import { FootprintEstimatorFactory } from '../domain/FootprintEstimatorFactory'

import { EstimationRequest } from './EstimationRequest'
import { EstimationResult } from './EstimationResult'

export class App {
  async getEstimate(estimationRequest: EstimationRequest): Promise<EstimationResult[]> {
    const ebsDatasource = DatasourceFactory.create()
    const storageUsage = await ebsDatasource.getUsage(estimationRequest.startDate, estimationRequest.endDate)

    const ebsFootPrintEstimator = FootprintEstimatorFactory.create()
    const ebsStorageEstimates = ebsFootPrintEstimator.estimate(storageUsage)

    return ebsStorageEstimates.map((estimate) => {
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
