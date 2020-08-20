import { EstimationRequest, RawRequest, validate } from '@application/EstimationRequest'
import AWSServices from '@application/AWSServices'
import { reduceBy } from 'ramda'
import { CURRENT_REGIONS } from '@application/Config.json'
import moment from 'moment'
import { EstimationResult, ServiceEstimate } from '@application/EstimationResult'

export class App {
  async getCostAndEstimates(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)

    const regions: string[] = rawRequest.region ? [rawRequest.region] : CURRENT_REGIONS

    const estimatesByServiceByRegion = await Promise.all(
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

    const estimatesByDay = estimatesByServiceByRegion.flat().flatMap((estimates) => {
      const estimatesByDay = this.aggregateByDay(estimates)
      return estimatesByDay.map((estimate) => {
        return {
          timestamp: estimate.timestamp,
          serviceEstimates: [
            {
              timestamp: estimate.timestamp,
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
    estimatesByDay.forEach((estimate) => {
      const time = estimate.timestamp.getTime()
      if (!aggregateByTimestamp.has(time)) aggregateByTimestamp.set(time, estimate)
      else {
        const serviceEstimates = aggregateByTimestamp.get(time)
        serviceEstimates.serviceEstimates.push(...estimate.serviceEstimates)
      }
    })

    return Array.from(aggregateByTimestamp.values())
  }

  private aggregateByDay(estimationResults: ServiceEstimate[]) {
    const getDayOfEstimate = (estimationResult: ServiceEstimate) =>
      estimationResult.timestamp.toISOString().substr(0, 10)

    const accumulatingFn = (acc: ServiceEstimate, value: ServiceEstimate) => {
      const timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
      const wattHours = acc.wattHours + value.wattHours
      const co2e = acc.co2e + value.co2e
      const serviceName = value.serviceName
      const cost = acc.cost + value.cost
      return { timestamp, wattHours, co2e, serviceName, cost }
    }

    const estimatesByDayMap = reduceBy(
      accumulatingFn,
      { wattHours: 0, co2e: 0, timestamp: undefined, serviceName: undefined, cost: 0 },
      getDayOfEstimate,
      estimationResults,
    )
    return Object.values(estimatesByDayMap)
  }
}
