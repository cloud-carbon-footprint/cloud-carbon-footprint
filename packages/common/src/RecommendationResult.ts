/*
 * © 2021 Thoughtworks, Inc.
 */

export interface RecommendationResult {
  readonly cloudProvider: string
  readonly accountId: string
  readonly accountName: string
  readonly region: string | null
  readonly recommendationType: string
  readonly recommendationDetail?: string
  readonly resourceId?: string
  readonly instanceName?: string
  readonly functionName?: string
  readonly kilowattHourSavings: number
  costSavings?: number
  co2eSavings: number
  recommendationOptions?: ComputeOptimizerRecommendationOption[]
}

export type ComputeOptimizerRecommendationOption =
  | EC2RecommendationOption
  | EBSRecommendationOption
  | LambdaRecommendationOption

export type EC2RecommendationOption = {
  instanceType: string
  costSavings: string
}

export type EBSRecommendationOption = {
  volumeType: string
  volumeSize: string
  costSavings: string
}

export type LambdaRecommendationOption = {
  memorySize: string
  costSavings: string
}
