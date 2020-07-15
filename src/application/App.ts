import { EstimationRequest, RawRequest, validate } from './EstimationRequest'
import { EstimationResult } from './EstimationResult'
import FootprintEstimate from '@domain/FootprintEstimate'
import AWS from '@domain/AWS'

export class App {
  async getEstimate(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)

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
