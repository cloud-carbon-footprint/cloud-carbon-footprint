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
 *          description: aws, gcp, ...
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

/**
 * @openapi
 * components:
 *  schemas:
 *    EC2Recommendation:
 *      type: object
 *      properties:
 *        instanceType:
 *          type: string
 *        costSavings:
 *          type: string
 *        performanceRisk:
 *          type: string
 *        vcpus:
 *          type: string
 */
export type EC2RecommendationOption = {
  instanceType: string
  costSavings: string
  performanceRisk: string
  vcpus: string
}

/**
 * @openapi
 * components:
 *  schemas:
 *    EBSRecommendation:
 *      type: object
 *      properties:
 *        volumeType:
 *          type: string
 *        volumeSize:
 *          type: string
 *        costSavings:
 *          type: string
 *        performanceRisk:
 *          type: string
 */
export type EBSRecommendationOption = {
  volumeType: string
  volumeSize: string
  costSavings: string
  performanceRisk: string
}

/**
 * @openapi
 * components:
 *  schemas:
 *    LambdaRecommendation:
 *      type: object
 *      properties:
 *        memorySize:
 *          type: string
 *        costSavings:
 *          type: string
 *        performanceRisk?:
 *          type: string
 */
export type LambdaRecommendationOption = {
  memorySize: string
  costSavings: string
  performanceRisk?: string
}
