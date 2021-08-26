/*
 * © 2021 Thoughtworks, Inc.
 */

export { default as Logger } from './Logger'
export { default as configLoader } from './ConfigLoader'
export { default as Config } from './Config'
export type { QUERY_DATE_TYPES } from './Config'
export {
  PartialDataError,
  EstimationRequestValidationError,
  RecommendationsRequestValidationError,
} from './Errors'
export { reduceByTimestamp } from './EstimationResult'
export type { EstimationResult, ServiceData } from './EstimationResult'
export type { EmissionRatioResult } from './EmissionRatioResult'
export type { RecommendationResult } from './RecommendationResult'
export type { LookupTableInput, LookupTableOutput } from './LookupTableInput'
export {
  AWS_RECOMMENDATIONS_TARGETS,
  AWS_DEFAULT_RECOMMENDATION_TARGET,
} from './RecommendationTarget'
export * from './helpers'
export type { GoogleAuthClient } from './Types'
