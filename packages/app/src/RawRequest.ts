/*
 * © 2021 Thoughtworks, Inc.
 */

export interface FootprintEstimatesRawRequest {
  startDate?: string
  endDate?: string
  region?: string
  cloudProviderToSeed?: string
  ignoreCache?: string
  groupBy?: string
  limit?: string
  skip?: string
  cloudProviders?: string[]
  accounts?: string[]
  services?: string[]
  regions?: string[]
  tags?: Tags
}

export interface RecommendationsRawRequest {
  awsRecommendationTarget?: string
}

export interface Tags {
  [key: string]: string
}
