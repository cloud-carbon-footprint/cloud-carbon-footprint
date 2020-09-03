import Cost from '@domain/Cost'
import FootprintEstimate from '@domain/FootprintEstimate'
import ICloudService from '@domain/ICloudService'
import { ServiceData, EstimationResult } from './EstimationResult'

export type CostAggregate = {
  timestamp: Date
  cost: number
}

export type CostAggregator = (costs: Cost[]) => Map<string, CostAggregate>

export type FootprintEstimateAggregate = {
  timestamp: Date
  wattHours: number
  co2e: number
}

export type FootprintEstimateAggregator = (estimates: FootprintEstimate[]) => Map<string, FootprintEstimateAggregate>

export type CostAndEstimateJoiner = (
  service: string,
  region: string,
  costs: Map<string, CostAggregate>,
  estimates: Map<string, FootprintEstimateAggregate>,
) => ServiceData[]

export type ServiceDataTransformer = (
  service: ICloudService,
  region: string,
  costs: Cost[],
  estimates: FootprintEstimate[],
) => ServiceData[]

export type EstimationResultsTransformer = (serviceData: ServiceData[]) => EstimationResult[]
