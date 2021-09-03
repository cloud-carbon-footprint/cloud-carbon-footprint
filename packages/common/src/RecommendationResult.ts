/*
 * © 2021 Thoughtworks, Inc.
 */

export interface RecommendationResult {
  readonly cloudProvider: string
  readonly accountId: string
  readonly accountName: string
  readonly region: string | null
  readonly recommendationType: string
  readonly recommendationDetail: string
  readonly resourceId?: string
  readonly instanceName?: string
  readonly kilowattHourSavings: number
  costSavings: number
  co2eSavings: number
}
