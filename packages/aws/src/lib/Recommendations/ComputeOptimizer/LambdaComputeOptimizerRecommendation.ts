/*
 * © 2021 Thoughtworks, Inc.
 */
import { LambdaComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import ComputeOptimizerRecommendation from './ComputeOptimizerRecommendation'
import { LambdaRecommendationOption } from '@cloud-carbon-footprint/common'

export default class LambdaComputeOptimizerRecommendation extends ComputeOptimizerRecommendation {
  public accountId: string
  public accountName: string
  public functionName: string
  public functionVersion: string
  public region: string
  public type: string
  public memorySize: string
  public recommendationOptions: LambdaRecommendationOption[]

  constructor(
    computeOptimizerRecommendationData: Partial<LambdaComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.functionArn)
    this.type = computeOptimizerRecommendationData.finding
    this.memorySize =
      computeOptimizerRecommendationData.currentConfiguration_memorySize
    this.functionVersion = computeOptimizerRecommendationData.functionVersion
    this.functionName = this.getFunctionName(
      computeOptimizerRecommendationData.functionArn,
    )
    this.recommendationOptions = [
      {
        memorySize:
          computeOptimizerRecommendationData.recommendationOptions_1_configuration_memorySize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_1_estimatedMonthlySavings_value,
      },
      {
        memorySize:
          computeOptimizerRecommendationData.recommendationOptions_2_configuration_memorySize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_2_estimatedMonthlySavings_value,
      },
      {
        memorySize:
          computeOptimizerRecommendationData.recommendationOptions_3_configuration_memorySize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_3_estimatedMonthlySavings_value,
      },
    ]
  }

  private getFunctionName(functionArn: string) {
    const functionData = functionArn.split(':')
    return functionData[functionData.length - 2]
  }
}
