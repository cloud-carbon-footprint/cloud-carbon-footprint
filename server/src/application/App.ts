import { EstimationRequest, RawRequest, validate } from '@application/EstimationRequest'
import AWSServices from '@application/AWSServices'
import { reduceBy } from 'ramda'
import { CURRENT_REGIONS } from '@application/Config.json'
import moment from 'moment'
import { EstimationResult, ServiceEstimate } from '@application/EstimationResult'
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'

export default class App {
  async getCostAndEstimates(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)
    const regions: string[] = estimationRequest.region ? [estimationRequest.region] : CURRENT_REGIONS

    const estimatesByServiceByRegion = await Promise.all(
      regions.map(async (region) => {
        return await Promise.all(
          AWSServices().map(async (service) => {
            const costs = await this.getCosts(service, estimationRequest, region)
            const estimates = await this.getEstimates(service, estimationRequest, region)
            return this.combineCostsAndEstimatesByTimestamp(service, estimates, costs)
          }),
        )
      }),
    )

    const estimationResultsByDay = this.aggregateEstimationResultsByDay(estimatesByServiceByRegion)
    const estimationResultsByTimestamp = this.aggregateEstimationResultsByTimestamp(estimationResultsByDay)
    return Array.from(estimationResultsByTimestamp.values())
  }

  async getCosts(service: ICloudService, estimationRequest: EstimationRequest, region: string): Promise<Cost[]> {
    const costs = await service.getCosts(estimationRequest.startDate, estimationRequest.endDate, region)
    return costs
  }

  async getEstimates(
    service: ICloudService,
    estimationRequest: EstimationRequest,
    region: string,
  ): Promise<FootprintEstimate[]> {
    const estimates = await service.getEstimates(estimationRequest.startDate, estimationRequest.endDate, region)
    return estimates
  }

  private combineCostsAndEstimatesByTimestamp(service: ICloudService, estimates: FootprintEstimate[], costs: Cost[]) {
    return estimates.map((estimate) => {
      const estimateCosts = costs.filter((cost) => moment(cost.timestamp).isSame(estimate.timestamp))
      const cost = estimateCosts.reduce((acc, cost) => acc + cost.amount, 0)
      return { ...estimate, cost, serviceName: service.serviceName }
    })
  }

  private aggregateEstimationResultsByDay(
    estimatesByServiceByRegion: {
      cost: number
      serviceName: string
      timestamp: Date
      wattHours: number
      co2e: number
    }[][][],
  ): EstimationResult[] {
    const estimationResultsByDay = estimatesByServiceByRegion.flat().flatMap((estimates) => {
      const serviceEstimatesByDay = this.aggregateServiceEstimatesByDay(estimates)
      return serviceEstimatesByDay.map((estimate) => {
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

    return estimationResultsByDay
  }

  private aggregateEstimationResultsByTimestamp(estimationResultsByDay: EstimationResult[]): Map<any, any> {
    const estimationResultsByTimestamp = new Map()
    estimationResultsByDay.forEach((estimationResult) => {
      const time = estimationResult.timestamp.getTime()
      if (!estimationResultsByTimestamp.has(time)) estimationResultsByTimestamp.set(time, estimationResult)
      else {
        const serviceEstimates = estimationResultsByTimestamp.get(time)
        serviceEstimates.serviceEstimates.push(...estimationResult.serviceEstimates)
      }
    })
    return estimationResultsByTimestamp
  }

  private aggregateServiceEstimatesByDay(estimationResults: ServiceEstimate[]): ServiceEstimate[] {
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
