import { EstimationRequest, RawRequest, validate } from '@application/EstimationRequest'
import { EstimationResult } from '@application/EstimationResult'
import FootprintEstimate from '@domain/FootprintEstimate'
import AWSServices from '@application/AWSServices'

export class App {
  async getEstimate(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)

    const estimatesByService = await Promise.all(
      AWSServices(estimationRequest.region).map((service) => {
        return service.getEstimates(estimationRequest.startDate, estimationRequest.endDate, estimationRequest.region)
      }),
    )

    const estimates: EstimationResult[] = estimatesByService.flatMap((estimates, i) => {
      return estimates.map((estimate: FootprintEstimate) => {
        return {
          timestamp: estimate.timestamp,
          estimates: [
            {
              serviceName: AWSServices(estimationRequest.region)[i].serviceName,
              wattHours: estimate.wattHours,
              co2e: estimate.co2e,
            },
          ],
        }
      })
    })

    const aggregateByTimestamp = new Map<number, EstimationResult>()
    estimates.forEach((estimate) => {
      const time = estimate.timestamp.getTime()
      if (!aggregateByTimestamp.has(time)) aggregateByTimestamp.set(time, estimate)
      else {
        const serviceEstimates = aggregateByTimestamp.get(time)
        serviceEstimates.estimates.push(...estimate.estimates)
      }
    })

    return Array.from(aggregateByTimestamp.values())
  }
}
