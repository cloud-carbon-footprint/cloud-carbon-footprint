import { EstimationRequest } from './EstimationRequest'
import { EstimationResult } from './EstimationResult'
import FootprintEstimate from '../domain/FootprintEstimate'
import AWS from '../domain/AWS'

export class App {
  async getEstimate(estimationRequest: EstimationRequest): Promise<EstimationResult[]> {
    if (estimationRequest.startDate > estimationRequest.endDate) throw 'startDate cannot be greater than endDate'
    if (!estimationRequest.startDate) throw 'startDate cannot be undefined'
    if (!estimationRequest.endDate) throw 'endDate cannot be undefined'

    const estimates = await AWS()[0].getEstimates(estimationRequest.startDate, estimationRequest.endDate)

    return estimates.map((estimate: FootprintEstimate) => {
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
