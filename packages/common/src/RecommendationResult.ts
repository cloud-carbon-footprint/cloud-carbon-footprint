/*
 * © 2021 Thoughtworks, Inc.
 */

/**
 * @openapi
 * components:
 *  schemas:
 *    RecommendationsResponse:
 *      type: object
 *      properties:
 *        cloudProvider:
 *          type: string
 *          description: aws | gcp | azure
 *        accountId:
 *          type: string
 *        accountName:
 *          type: string
 *        region:
 *          type: string
 *        recommendationType:
 *          type: string
 *        recommendationDetail?:
 *          type: string
 *        resourceId?:
 *          type: string
 *        instanceName?:
 *          type: string
 *        kilowattHourSavings:
 *          type: number
 *        costSavings:
 *          type: number
 *        co2eSavings:
 *          type: number
 *        recommendationOptions?:
 *          type: object
 *          description: Either EC2, EBS, or Lambda recommendation
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
  performanceRisk: string
  vcpus: string
}

export type EBSRecommendationOption = {
  volumeType: string
  volumeSize: string
  costSavings: string
  performanceRisk: string
}

export type LambdaRecommendationOption = {
  memorySize: string
  costSavings: string
  performanceRisk?: string
}
