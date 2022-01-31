/*
 * © 2021 Thoughtworks, Inc.
 */
import { EC2RecommendationOption } from '@cloud-carbon-footprint/common'
import { EC2ComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import ComputeOptimizerRecommendation from './ComputeOptimizerRecommendation'

export default class EC2ComputeOptimizerRecommendation extends ComputeOptimizerRecommendation {
  public accountId: string
  public accountName: string
  public region: string
  public type: string
  public instanceName: string
  public resourceId: string
  public recommendationOptions: EC2RecommendationOption[]
  public usageAmount: number

  constructor(
    computeOptimizerRecommendationData: Partial<EC2ComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.instanceArn)
    this.type = `EC2-${computeOptimizerRecommendationData.finding}`
    this.resourceId = this.getResourceId(
      computeOptimizerRecommendationData.instanceArn,
    )
    this.recommendationOptions = [
      {
        instanceType:
          computeOptimizerRecommendationData.recommendationOptions_1_instanceType,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_1_estimatedMonthlySavings_value,
      },
      {
        instanceType:
          computeOptimizerRecommendationData.recommendationOptions_2_instanceType,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_2_estimatedMonthlySavings_value,
      },
      {
        instanceType:
          computeOptimizerRecommendationData.recommendationOptions_3_instanceType,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_3_estimatedMonthlySavings_value,
      },
    ]
  }
}
