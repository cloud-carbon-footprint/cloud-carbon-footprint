import { EstimationRequest } from '@application/CreateValidRequest'
import AWSServices from '@application/AWSServices'
import GCPServices from '@application/GCPServices'
import { union } from 'ramda'
import { AWS, GCP } from '@application/Config.json'
import { EstimationResult, reduceByTimestamp } from '@application/EstimationResult'

import Cost, { aggregateCostsByDay } from '@domain/Cost'
import FootprintEstimate, { aggregateEstimatesByDay } from '@domain/FootprintEstimate'
import cache from '@application/Cache'
import moment from 'moment'
import Region from '@domain/Region'

export default class App {
  @cache()
  async getCostAndEstimates(request: EstimationRequest): Promise<EstimationResult[]> {
    const GCPSupportedServices = GCPServices()

    const startDate = request.startDate
    const endDate = request.endDate

    if (request.region) {
      const awsServices = AWSServices(request.region)
      const region = new Region(request.region, awsServices, AWS.NAME)
      return this.getRegionData(region, startDate, endDate)
    } else {
      const AWSEstimatesByRegion = await Promise.all(
        AWS.CURRENT_REGIONS.map(async (regionId) => {
          const awsServices = AWSServices(regionId)
          const region = new Region(regionId, awsServices, AWS.NAME)
          return this.getRegionData(region, startDate, endDate)
        }),
      )

      const GCPEstimatesByRegion = await Promise.all(
        GCP.CURRENT_REGIONS.map(async (regionId) => {
          const region = new Region(regionId, GCPSupportedServices, GCP.NAME)
          return this.getRegionData(region, startDate, endDate)
        }),
      )
      return reduceByTimestamp(AWSEstimatesByRegion.flat().concat(GCPEstimatesByRegion.flat()))
    }
  }

  private async getRegionData(region: Region, startDate: Date, endDate: Date): Promise<EstimationResult[]> {
    const [regionEstimates, regionCosts] = await Promise.all([
      region.getEstimates(startDate, endDate),
      region.getCosts(startDate, endDate),
    ])

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
              cloudProvider: region.cloudProvider,
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

    let estimates = reduceByTimestamp(estimatesGroupByService.flat())
    estimates = estimates.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    return estimates
  }
}
