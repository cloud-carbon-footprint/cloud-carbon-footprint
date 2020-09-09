import { EstimationRequest, validate } from '@application/EstimationRequest'
import AWSServices from '@application/AWSServices'
import { reduceBy, union } from 'ramda'
import { CURRENT_REGIONS } from '@application/Config.json'
import { EstimationResult } from '@application/EstimationResult'
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'
import { RawRequest } from '@view/RawRequest'
import cache from '@application/Cache'
import moment from 'moment'

export default class App {
  @cache()
  async getCostAndEstimates(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)

    if (estimationRequest.region) {
      return await this.getEstimatesByRegion(estimationRequest, estimationRequest.region)
    } else {
      const estimatesByRegion = await Promise.all(
        CURRENT_REGIONS.map(async (region) => {
          return await this.getEstimatesByRegion(estimationRequest, region)
        }),
      )
      return estimatesByRegion.flat()
    }
  }

  private async getEstimatesByRegion(estimationRequest: EstimationRequest, region: string) {
    const estimatesByService: EstimationResult[][] = await Promise.all(
      AWSServices().map((service) => {
        return this.getServiceData(service, estimationRequest, region)
      }),
    )
    const estimatesByTimestamp = this.groupByTimestamp(estimatesByService.flat())
    return Array.from(estimatesByTimestamp.values())
  }

  private async getServiceData(service: ICloudService, estimationRequest: EstimationRequest, region: string) {
    const estimates = await this.getEstimates(service, estimationRequest, region)
    const costs = await this.getCosts(service, estimationRequest, region)
    return this.attachCosts(estimates, costs, service, region)
  }

  public async getEstimates(
    service: ICloudService,
    estimationRequest: EstimationRequest,
    region: string,
  ): Promise<{ [date: string]: FootprintEstimate }> {
    const estimates = await service.getEstimates(estimationRequest.startDate, estimationRequest.endDate, region)
    return this.aggregateEstimatesByDay(estimates)
  }

  private aggregateEstimatesByDay(estimates: FootprintEstimate[]): { [date: string]: FootprintEstimate } {
    const getDayOfEstimate = (estimate: { timestamp: Date }) => estimate.timestamp.toISOString().substr(0, 10)

    const accumulatingFn = (acc: FootprintEstimate, value: FootprintEstimate) => {
      acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
      acc.wattHours += value.wattHours
      acc.co2e += value.co2e
      return acc
    }

    return reduceBy(accumulatingFn, { wattHours: 0, co2e: 0, timestamp: undefined }, getDayOfEstimate, estimates)
  }

  public async getCosts(
    service: ICloudService,
    estimationRequest: EstimationRequest,
    region: string,
  ): Promise<{ [date: string]: Cost }> {
    const costs = await service.getCosts(estimationRequest.startDate, estimationRequest.endDate, region)
    return this.aggregateCostsByDay(costs)
  }

  private aggregateCostsByDay(estimates: Cost[]): { [date: string]: Cost } {
    const getDayOfEstimate = (estimate: { timestamp: Date }) => estimate.timestamp.toISOString().substr(0, 10)
    const accumulatingFn = (acc: Cost, value: Cost) => {
      acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
      acc.amount += value.amount
      acc.currency = acc.currency || value.currency
      return acc
    }

    return reduceBy(
      accumulatingFn,
      { amount: 0, currency: undefined, timestamp: undefined },
      getDayOfEstimate,
      estimates,
    )
  }

  private attachCosts(
    estimatesByDay: { [date: string]: FootprintEstimate },
    costsByDay: { [p: string]: Cost },
    service: ICloudService,
    region: string,
  ) {
    const dates = union(Object.keys(estimatesByDay), Object.keys(costsByDay))

    const estimationResults: EstimationResult[] = dates.map((date) => {
      return {
        timestamp: moment.utc(date).toDate(),
        serviceEstimates: [
          {
            timestamp: moment.utc(date).toDate(),
            serviceName: service.serviceName,
            wattHours: estimatesByDay[date]?.wattHours || 0,
            co2e: estimatesByDay[date]?.co2e || 0,
            cost: costsByDay[date]?.amount || 0,
            region: region,
          },
        ],
      }
    })

    return estimationResults
  }

  private groupByTimestamp(estimationResultsByDay: EstimationResult[]): Map<any, any> {
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
}
