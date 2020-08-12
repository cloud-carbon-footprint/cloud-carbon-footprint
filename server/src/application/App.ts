import { EstimationRequest, RawRequest, validate } from '@application/EstimationRequest'
import { EstimationResult } from '@application/EstimationResult'

import AWSServices from '@application/AWSServices'

import { reduceBy } from 'ramda'

interface ServiceEstimate {
  serviceName: string
  timestamp: Date
  wattHours: number
  co2e: number
}

export class App {
  async getEstimate(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)

    const regions: string[] = rawRequest.region ? [rawRequest.region] : ['us-east-1', 'us-east-2', 'us-west-1']

    const estimatesByService = await Promise.all(
      regions.map(async (region) => {
        return await Promise.all(
          AWSServices().map((service) => {
            return service
              .getEstimates(estimationRequest.startDate, estimationRequest.endDate, region)
              .then((estimates) =>
                estimates.map((estimate) => {
                  return { ...estimate, serviceName: service.serviceName }
                }),
              )
          }),
        )
      }),
    )

    const estimates = estimatesByService.flat().flatMap((estimates) => {
      const estimatesByDay = this.aggregateByDay(estimates)
      return estimatesByDay.map((estimate) => {
        return {
          timestamp: estimate.timestamp,
          estimates: [
            {
              serviceName: estimate.serviceName,
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

  private aggregateByDay(estimates: ServiceEstimate[]) {
    const getDayOfEstimate = (estimate: ServiceEstimate) => estimate.timestamp.toISOString().substr(0, 10)

    const accumulatingFn = (acc: ServiceEstimate, value: ServiceEstimate) => {
      acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
      acc.wattHours += value.wattHours
      acc.co2e += value.co2e
      acc.serviceName = value.serviceName
      return acc
    }

    const estimatesByDayMap = reduceBy(
      accumulatingFn,
      { wattHours: 0, co2e: 0, timestamp: undefined, serviceName: undefined },
      getDayOfEstimate,
      estimates,
    )
    return Object.values(estimatesByDayMap)
  }
}
