/*
 * © 2021 ThoughtWorks, Inc.
 */
import { union } from 'ramda'
import moment from 'moment'

import {
  FootprintEstimate,
  aggregateEstimatesByDay,
  aggregateCostsByDay,
  Region,
  Cost,
} from '@cloud-carbon-footprint/core'
import {
  EstimationResult,
  reduceByTimestamp,
} from '@cloud-carbon-footprint/common'

export default class CloudProviderAccount {
  name?: string
  async getRegionData(
    region: Region,
    startDate: Date,
    endDate: Date,
  ): Promise<EstimationResult[]> {
    const [regionEstimates, regionCosts] = await Promise.all([
      region.getEstimates(startDate, endDate),
      region.getCosts(startDate, endDate),
    ])

    const estimatesGroupByService: EstimationResult[][] = region.services.map(
      (service) => {
        const estimates: FootprintEstimate[] =
          regionEstimates[service.serviceName]
        const estimatesByDay = aggregateEstimatesByDay(estimates)

        const costs: Cost[] = regionCosts[service.serviceName]
        const costsByDay = aggregateCostsByDay(costs)

        const dates = union(
          Object.keys(estimatesByDay),
          Object.keys(costsByDay),
        )

        const dataByDay = dates.reduce(
          (
            acc: {
              [date: string]: { estimate: FootprintEstimate; cost: Cost }
            },
            date,
          ) => {
            acc[date] = {
              estimate: estimatesByDay[date],
              cost: costsByDay[date],
            }
            return acc
          },
          {},
        )

        const estimationResults: EstimationResult[] = Object.entries(
          dataByDay,
        ).map(([date, { estimate, cost }]) => {
          return {
            timestamp: moment.utc(date).toDate(),
            serviceEstimates: [
              {
                cloudProvider: region.cloudProvider,
                accountName: this.name,
                serviceName: service.serviceName,
                region: region.id,
                kilowattHours: estimate?.kilowattHours || 0,
                co2e: estimate?.co2e || 0,
                cost: cost?.amount || 0,
                usesAverageCPUConstant: estimate?.usesAverageCPUConstant,
              },
            ],
          }
        })

        return estimationResults
      },
    )

    let estimates = reduceByTimestamp(estimatesGroupByService.flat())
    estimates = estimates.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    )
    return estimates
  }
}
