/*
 * © 2021 ThoughtWorks, Inc.
 */

export interface RecommendationResult {
  readonly cloudProvider: string
  readonly accountId: string
  readonly accountName: string
  readonly region: string | null
  readonly recommendationType: string
  readonly recommendationDetail: string
  readonly kilowattHourSavings: number
  readonly costSavings: number
  readonly co2eSavings: number
}
