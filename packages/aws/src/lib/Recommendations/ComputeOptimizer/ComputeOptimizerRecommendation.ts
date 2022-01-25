/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  ComputeOptimizerRecommendationData,
  RecommendationOption,
} from '@cloud-carbon-footprint/common'

export default class ComputeOptimizerRecommendation {
  public accountId: string
  public accountName: string
  public region: string
  public type: string
  public instanceName: string
  public resourceId: string
  public recommendationOptions: RecommendationOption[]
  public usageAmount: number

  constructor(init: Partial<ComputeOptimizerRecommendationData>) {
    Object.assign(this, init)

    this.accountName = this.accountId
    this.region = init.instanceArn.split(':')[3]
    this.type = init.finding
    this.resourceId = init.instanceArn.split('/').pop()
    this.recommendationOptions = [
      {
        instanceType: init.recommendationOptions_1_instanceType,
        costSavings: init.recommendationOptions_1_estimatedMonthlySavings_value,
      },
      {
        instanceType: init.recommendationOptions_2_instanceType,
        costSavings: init.recommendationOptions_2_estimatedMonthlySavings_value,
      },
      {
        instanceType: init.recommendationOptions_3_instanceType,
        costSavings: init.recommendationOptions_3_estimatedMonthlySavings_value,
      },
    ]
  }
}
