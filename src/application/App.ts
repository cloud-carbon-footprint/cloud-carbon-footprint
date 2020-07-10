import { EstimationRequest } from './EstimationRequest'
import { EstimationResult } from './EstimationResult'
import moment = require('moment')

export class App {
  async getEstimate(estimationRequest: EstimationRequest): Promise<EstimationResult[]> {
    return [...Array(7)].map((v, i) => {
      return {
        timestamp: moment('2020-12-07').add(i, 'days').toDate(),
        estimates: [
          {
            serviceName: 'ebs',
            wattHours: 50,
            co2e: 0.05,
          },
        ],
      }
    })
  }
}
