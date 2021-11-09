/*
 * © 2021 Thoughtworks, Inc.
 */

export interface FootprintEstimatesRawRequest {
  startDate?: string
  endDate?: string
  region?: string
  ignoreCache?: string
}

export interface RecommendationsRawRequest {
  awsRecommendationTarget?: string
}
