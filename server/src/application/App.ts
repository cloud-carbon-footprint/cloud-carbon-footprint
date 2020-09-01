import { EstimationRequest, validate } from '@application/EstimationRequest'
import AWSServices from '@application/AWSServices'
import { reduceBy } from 'ramda'
import { CURRENT_REGIONS } from '@application/Config.json'
import moment from 'moment'
import { EstimationResult, ServiceData } from '@application/EstimationResult'
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'
import { RawRequest } from '@view/RawRequest'

export default class App {
  async getCostAndEstimates(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)
    const regions: string[] = estimationRequest.region ? [estimationRequest.region] : CURRENT_REGIONS

    const estimatesByServiceByRegion = await Promise.all(
      regions.map(async (region) => {
        return await Promise.all(
          AWSServices().map(async (service) => {
            const [costs, estimates] = await Promise.all([
              await this.getCosts(service, estimationRequest, region),
              await this.getEstimates(service, estimationRequest, region),
            ])
            return this.combineCostsAndEstimatesByTimestamp(service, region, costs, estimates)
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

  private combineCostsAndEstimatesByTimestamp(
    service: ICloudService,
    region: string,
    costs: Cost[],
    estimates: FootprintEstimate[],
  ) {
    return estimates.map((estimate) => {
      const estimateCosts = costs.filter((cost) => moment(cost.timestamp).isSame(estimate.timestamp))
      const cost = estimateCosts.reduce((acc, cost) => acc + cost.amount, 0)
      return { ...estimate, cost, serviceName: service.serviceName, region: region }
    })
  }

  private aggregateEstimationResultsByDay(
    estimatesByServiceByRegion: {
      cost: number
      serviceName: string
      timestamp: Date
      wattHours: number
      co2e: number
      region: string
    }[][][],
  ): EstimationResult[] {
    const estimationResultsByDay = estimatesByServiceByRegion.flat().flatMap((estimates) => {
      const serviceEstimatesByDay = this.aggregateServiceEstimatesByDay(estimates)
      return serviceEstimatesByDay.map((serviceDataResult) => {
        return {
          timestamp: serviceDataResult.timestamp,
          serviceEstimates: [
            {
              timestamp: serviceDataResult.timestamp,
              serviceName: serviceDataResult.serviceName,
              wattHours: serviceDataResult.wattHours,
              co2e: serviceDataResult.co2e,
              cost: serviceDataResult.cost,
              region: serviceDataResult.region,
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

  private aggregateServiceEstimatesByDay(serviceDataResults: ServiceData[]): ServiceData[] {
    const getDayOfEstimate = (serviceDataResult: ServiceData) => serviceDataResult.timestamp.toISOString().substr(0, 10)

    const accumulatingFn = (acc: ServiceData, value: ServiceData) => {
      const timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
      const wattHours = acc.wattHours + value.wattHours
      const co2e = acc.co2e + value.co2e
      const serviceName = value.serviceName
      const cost = acc.cost + value.cost
      const region = value.region
      return { timestamp, wattHours, co2e, serviceName, cost, region }
    }

    const estimatesByDayMap = reduceBy(
      accumulatingFn,
      { wattHours: 0, co2e: 0, timestamp: undefined, serviceName: undefined, cost: 0, region: undefined },
      getDayOfEstimate,
      serviceDataResults,
    )
    return Object.values(estimatesByDayMap)
  }
}
