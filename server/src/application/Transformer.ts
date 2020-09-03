import ICloudService from '@domain/ICloudService'
import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'
import { ServiceData, EstimationResult } from './EstimationResult'
import moment from 'moment'
import {
  CostAggregator,
  CostAggregate,
  FootprintEstimateAggregator,
  FootprintEstimateAggregate,
  CostAndEstimateJoiner,
  ServiceDataTransformer,
  EstimationResultsTransformer,
} from './TransformerTypes'

const aggregateCosts: CostAggregator = (costs: Cost[]) => {
  const costAggregates = new Map<string, CostAggregate>()

  costs.forEach((cost) => {
    const utcDateString = moment.utc(cost.timestamp).toISOString().substr(0, 10)

    if (!costAggregates.has(utcDateString)) {
      costAggregates.set(utcDateString, {
        timestamp: new Date(cost.timestamp.toISOString().substr(0, 10)),
        cost: cost.amount,
      })
    } else {
      costAggregates.set(utcDateString, {
        timestamp: costAggregates.get(utcDateString).timestamp,
        cost: costAggregates.get(utcDateString).cost + cost.amount,
      })
    }
  })

  return costAggregates
}

const aggregateEstimates: FootprintEstimateAggregator = (estimates: FootprintEstimate[]) => {
  const estimateAggregates = new Map<string, FootprintEstimateAggregate>()

  estimates.forEach((estimate) => {
    const utcDateString = moment.utc(estimate.timestamp).toISOString().substr(0, 10)

    if (!estimateAggregates.has(utcDateString)) {
      estimateAggregates.set(utcDateString, {
        timestamp: new Date(estimate.timestamp.toISOString().substr(0, 10)),
        wattHours: estimate.wattHours,
        co2e: estimate.co2e,
      })
    } else {
      estimateAggregates.set(utcDateString, {
        timestamp: estimateAggregates.get(utcDateString).timestamp,
        wattHours: estimateAggregates.get(utcDateString).wattHours + estimate.wattHours,
        co2e: estimateAggregates.get(utcDateString).co2e + estimate.co2e,
      })
    }
  })

  return estimateAggregates
}

const joinCostsAndEstimations: CostAndEstimateJoiner = (
  serviceName: string,
  region: string,
  costAggregates: Map<string, CostAggregate>,
  estimateAggregates: Map<string, FootprintEstimateAggregate>,
) => {
  const utcDateStrings = new Set()

  costAggregates.forEach((_aggregate, utcDateString) => utcDateStrings.add(utcDateString))
  estimateAggregates.forEach((_aggregate, utcDateString) => utcDateStrings.add(utcDateString))

  return Array.from(utcDateStrings).map((utcDateString: string) => {
    const costAggregate = costAggregates.has(utcDateString)
      ? costAggregates.get(utcDateString)
      : { cost: 0, timestamp: null }
    const estimateAggregate = estimateAggregates.has(utcDateString)
      ? estimateAggregates.get(utcDateString)
      : { wattHours: 0, co2e: 0, timestamp: null }

    return {
      timestamp: costAggregate.timestamp || estimateAggregate.timestamp,
      serviceName: serviceName,
      region: region,
      cost: costAggregate.cost,
      co2e: estimateAggregate.co2e,
      wattHours: estimateAggregate.wattHours,
    }
  })
}

export const transformToServiceData: ServiceDataTransformer = (
  service: ICloudService,
  region: string,
  costs: Cost[],
  estimates: FootprintEstimate[],
): ServiceData[] => {
  const costAggregates: Map<string, CostAggregate> = aggregateCosts(costs)
  const estimateAggregates: Map<string, FootprintEstimateAggregate> = aggregateEstimates(estimates)

  return joinCostsAndEstimations(service.serviceName, region, costAggregates, estimateAggregates)
}

export const transformToEstimationResults: EstimationResultsTransformer = (
  serviceData: ServiceData[],
): EstimationResult[] => {
  const serviceDataByTimestamp = new Map<string, ServiceData[]>()
  const estimationResults: EstimationResult[] = []

  serviceData.forEach((serviceDatum) => {
    const timestampString = moment.utc(serviceDatum.timestamp).toISOString().substr(0, 10)
    if (!serviceDataByTimestamp.has(timestampString)) {
      serviceDataByTimestamp.set(timestampString, [serviceDatum])
    } else {
      serviceDataByTimestamp.get(timestampString).push(serviceDatum)
    }
  })

  serviceDataByTimestamp.forEach((serviceData: ServiceData[], timestamp: string) => {
    estimationResults.push({
      timestamp: new Date(timestamp),
      serviceEstimates: serviceData,
    })
  })

  estimationResults.sort((a: EstimationResult, b: EstimationResult) => (a.timestamp < b.timestamp ? -1 : 1))

  return estimationResults
}
