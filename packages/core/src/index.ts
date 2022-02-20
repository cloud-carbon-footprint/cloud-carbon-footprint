/*
 * © 2021 Thoughtworks, Inc.
 */

export * from './memory'
export * from './networking'
export * from './storage'
export * from './compute'
export * from './cost'
export * from './unknown'
export * from './embodiedEmissions'
export { default as CloudProviderAccount } from './CloudProviderAccount'
export {
  default as CloudConstants,
  CloudConstantsByProvider,
  CloudConstantsEmissionsFactors,
  ReplicationFactorsForService,
} from './CloudConstantsTypes'
export { US_NERC_REGIONS_EMISSIONS_FACTORS } from './FootprintEstimationConstants'
export { default as UsageData } from './IUsageData'
export {
  default as FootprintEstimate,
  appendOrAccumulateEstimatesByDay,
  accumulateKilowattHours,
  MutableEstimationResult,
  aggregateEstimatesByDay,
  getWattsByAverageOrMedian,
  getAverage,
  estimateCo2,
  estimateKwh,
  KilowattHoursByServiceAndUsageUnit,
  KilowattHourTotals,
  AccumulateKilowattHoursBy,
} from './FootprintEstimate'
export { default as ICloudService } from './ICloudService'
export { default as BillingDataRow } from './BillingDataRow'

export { default as IUsageData } from './IUsageData'
export { default as ICloudRecommendationsService } from './ICloudRecommendationsService'
export { default as IFootprintEstimator } from './IFootprintEstimator'
export { default as Region, RegionEstimates, RegionCosts } from './Region'
export { default as FootprintEstimatesDataBuilder } from './FootprintEstimatesDataBuilder'
