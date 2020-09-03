import { ServiceResponseTransformer } from './ServiceCall'
import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'
import { ServiceResult, EstimationResult } from './EstimationResult'
import moment from 'moment'

export const defaultTransformer: ServiceResponseTransformer = (
  service: ICloudService,
  costs: Cost[],
  footprintEstimates: FootprintEstimate[],
): ServiceResult => {
  const aggregationByDate = new Map()

  footprintEstimates.forEach((footprintEstimate) => {
    const matchedCosts = costs.filter((cost) => moment(cost.timestamp).isSame(footprintEstimate.timestamp))
    const accumulatedCost = matchedCosts.reduce((acc, cost) => acc + cost.amount, 0)
    const timestamp = new Date(footprintEstimate.timestamp.toISOString().substr(0, 10))
    const timestampAsString = timestamp.toISOString().substr(0, 10)

    if (!aggregationByDate.has(timestampAsString)) {
      aggregationByDate.set(timestampAsString, {
        timestampAsDate: timestamp,
        co2e: footprintEstimate.co2e,
        wattHours: footprintEstimate.wattHours,
        cost: accumulatedCost,
      })
    } else {
      const { co2e, wattHours, cost } = aggregationByDate.get(timestampAsString)
      aggregationByDate.set(timestampAsString, {
        timestampAsDate: timestamp,
        co2e: co2e + footprintEstimate.co2e,
        wattHours: wattHours + footprintEstimate.wattHours,
        cost: cost + accumulatedCost,
      })
    }
  })

  const estimateResults: EstimationResult[] = []
  aggregationByDate.forEach((usageData) => {
    estimateResults.push({
      timestamp: usageData.timestampAsDate,
      serviceData: [
        {
          co2e: usageData.co2e,
          cost: usageData.cost,
          wattHours: usageData.wattHours,
        },
      ],
    })
  })
  estimateResults.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))

  return {
    serviceName: service.serviceName,
    estimationResults: estimateResults,
  }
}
