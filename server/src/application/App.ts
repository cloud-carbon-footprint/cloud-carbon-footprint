import { EstimationRequest, validate } from '@application/EstimationRequest'
import AWSServices from '@application/AWSServices'
import { union } from 'ramda'
import { CURRENT_REGIONS } from '@application/Config.json'
import { EstimationResult, reduceByTimestamp } from '@application/EstimationResult'

import Cost, { aggregateCostsByDay } from '@domain/Cost'
import FootprintEstimate, { aggregateEstimatesByDay } from '@domain/FootprintEstimate'
import { RawRequest } from '@view/RawRequest'
import cache from '@application/Cache'
import moment from 'moment'
import Region from '@domain/Region'

export default class App {
  @cache()
  async getCostAndEstimates(rawRequest: RawRequest): Promise<EstimationResult[]> {
    const estimationRequest: EstimationRequest = validate(rawRequest)

    const services = AWSServices()

    const startDate = estimationRequest.startDate
    const endDate = estimationRequest.endDate

    if (estimationRequest.region) {
      const region = new Region(estimationRequest.region, services)
      return this.getRegionData(region, startDate, endDate)
    } else {
      const estimatesByRegion = await Promise.all(
        CURRENT_REGIONS.map(async (regionId) => {
          const region = new Region(regionId, services)
          return this.getRegionData(region, estimationRequest.startDate, estimationRequest.endDate)
        }),
      )
      return reduceByTimestamp(estimatesByRegion.flat())
    }
  }

  private async getRegionData(region: Region, startDate: Date, endDate: Date) {
    const data = await Promise.all([region.getEstimates(startDate, endDate), region.getCosts(startDate, endDate)])

    const regionEstimates = data[0]
    const regionCosts = data[1]

    const estimatesGroupByService: EstimationResult[][] = region.services.map((service) => {
      const estimates: FootprintEstimate[] = regionEstimates[service.serviceName]
      const estimatesByDay = aggregateEstimatesByDay(estimates)

      const costs: Cost[] = regionCosts[service.serviceName]
      const costsByDay = aggregateCostsByDay(costs)

      const dates = union(Object.keys(estimatesByDay), Object.keys(costsByDay))

      const dataByDay = dates.reduce((acc: { [date: string]: { estimate: FootprintEstimate; cost: Cost } }, date) => {
        acc[date] = {
          estimate: estimatesByDay[date],
          cost: costsByDay[date],
        }
        return acc
      }, {})

      const estimationResults: EstimationResult[] = Object.entries(dataByDay).map(([date, { estimate, cost }]) => {
        return {
          timestamp: moment.utc(date).toDate(),
          serviceEstimates: [
            {
              serviceName: service.serviceName,
              region: region.id,
              wattHours: estimate?.wattHours || 0,
              co2e: estimate?.co2e || 0,
              cost: cost?.amount || 0,
            },
          ],
        }
      })

      return estimationResults
    })

    const estimatesGroupByTimestamp = reduceByTimestamp(estimatesGroupByService.flat())
    let estimationResults = Array.from(estimatesGroupByTimestamp.values())
    estimationResults = estimationResults.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    return estimationResults
  }
}
