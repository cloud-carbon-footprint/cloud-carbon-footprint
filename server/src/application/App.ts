import { EstimationRequest, RawRequest, validate } from '@application/EstimationRequest'

import AWSServices from '@application/AWSServices'
import { reduceBy } from 'ramda'
import { CURRENT_REGIONS } from '@application/Config.json'
import moment from 'moment'
import { ServiceEstimate } from '@application/EstimationResult'

export interface ServiceDailyMetric {
  serviceName: string
  timestamp: Date
  wattHours: number
  co2e: number
  cost: number
}

export interface ServiceDailyMetricResult {
  readonly timestamp: Date
  readonly estimates: ServiceEstimate[]
}

export class App {
  async getEstimate(rawRequest: RawRequest): Promise<ServiceDailyMetricResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)

    const regions: string[] = rawRequest.region ? [rawRequest.region] : CURRENT_REGIONS

    const estimatesByService = await Promise.all(
      regions.map(async (region) => {
        return await Promise.all(
          AWSServices().map(async (service) => {
            const costs = await service.getCosts(estimationRequest.startDate, estimationRequest.endDate, region)
            const estimates = await service.getEstimates(estimationRequest.startDate, estimationRequest.endDate, region)
            return estimates.map((estimate) => {
              const estimateCosts = costs.filter((cost) => moment(cost.timestamp).isSame(estimate.timestamp))
              const cost = estimateCosts.reduce((acc, cost) => acc + cost.amount, 0)
              return { ...estimate, cost, serviceName: service.serviceName }
            })
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
              cost: estimate.cost,
            },
          ],
        }
      })
    })

    const aggregateByTimestamp = new Map()
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

  private aggregateByDay(estimates: ServiceDailyMetric[]) {
    const getDayOfEstimate = (estimate: ServiceDailyMetric) => estimate.timestamp.toISOString().substr(0, 10)

    const accumulatingFn = (acc: ServiceDailyMetric, value: ServiceDailyMetric) => {
      acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
      acc.wattHours += value.wattHours
      acc.co2e += value.co2e
      acc.serviceName = value.serviceName
      acc.cost += value.cost
      return acc
    }

    const estimatesByDayMap = reduceBy(
      accumulatingFn,
      { wattHours: 0, co2e: 0, timestamp: undefined, serviceName: undefined, cost: 0 },
      getDayOfEstimate,
      estimates,
    )
    return Object.values(estimatesByDayMap)
  }
}
