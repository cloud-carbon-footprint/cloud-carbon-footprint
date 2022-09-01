/*
 * © 2021 Thoughtworks, Inc.
 */

export { default as Logger } from './Logger'
export { default as configLoader, setConfig } from './ConfigLoader'
export { default as Config } from './Config'
export type { QUERY_DATE_TYPES, CCFConfig } from './Config'
export { GroupBy } from './Config'
export {
  PartialDataError,
  EstimationRequestValidationError,
  RecommendationsRequestValidationError,
} from './Errors'
export { reduceByTimestamp } from './EstimationResult'
export type {
  EstimationResult,
  ServiceData,
  TagCollection,
} from './EstimationResult'
export type { EmissionRatioResult } from './EmissionRatioResult'
export type {
  RecommendationResult,
  EC2RecommendationOption,
  EBSRecommendationOption,
  LambdaRecommendationOption,
  ComputeOptimizerRecommendationOption,
} from './RecommendationResult'
export type { LookupTableInput, LookupTableOutput } from './LookupTableInput'
export type {
  OnPremiseDataInput,
  OnPremiseDataOutput,
} from './OnPremiseDataInput'
export {
  AWS_RECOMMENDATIONS_TARGETS,
  AWS_DEFAULT_RECOMMENDATION_TARGET,
} from './RecommendationTarget'
export {
  AWS_RECOMMENDATIONS_SERVICES,
  AWS_DEFAULT_RECOMMENDATIONS_SERVICE,
} from './RecommendationsService'
export * from './helpers'
export type { GoogleAuthClient } from './Types'
