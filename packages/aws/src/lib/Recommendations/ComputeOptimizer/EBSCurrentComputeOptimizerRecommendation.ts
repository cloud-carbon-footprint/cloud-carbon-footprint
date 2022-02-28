/*
 * © 2021 Thoughtworks, Inc.
 */
import { EBSComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import ComputeOptimizerRecommendation from './ComputeOptimizerRecommendation'

export default class EBSCurrentComputeOptimizerRecommendation extends ComputeOptimizerRecommendation {
  public volumeType: string
  public volumeSize: number

  constructor(
    computeOptimizerRecommendationData: Partial<EBSComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.volumeArn)
    this.type = `EBS-${computeOptimizerRecommendationData.finding}`
    this.volumeType =
      computeOptimizerRecommendationData.currentConfiguration_volumeType
    this.volumeSize = parseInt(
      computeOptimizerRecommendationData.currentConfiguration_volumeSize,
    )
    this.description = `${this.volumeType}(${this.volumeSize}GB)`

    this.resourceId = this.getResourceId(
      computeOptimizerRecommendationData.volumeArn,
    )
    this.recommendationOptions = [
      {
        volumeType:
          computeOptimizerRecommendationData.recommendationOptions_1_configuration_volumeType,
        volumeSize:
          computeOptimizerRecommendationData.recommendationOptions_1_configuration_volumeSize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_1_estimatedMonthlySavings_value,
        performanceRisk:
          computeOptimizerRecommendationData.recommendationOptions_1_performanceRisk,
      },
      {
        volumeType:
          computeOptimizerRecommendationData.recommendationOptions_2_configuration_volumeType,
        volumeSize:
          computeOptimizerRecommendationData.recommendationOptions_2_configuration_volumeSize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_2_estimatedMonthlySavings_value,
        performanceRisk:
          computeOptimizerRecommendationData.recommendationOptions_2_performanceRisk,
      },
      {
        volumeType:
          computeOptimizerRecommendationData.recommendationOptions_3_configuration_volumeType,
        volumeSize:
          computeOptimizerRecommendationData.recommendationOptions_3_configuration_volumeSize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_3_estimatedMonthlySavings_value,
        performanceRisk:
          computeOptimizerRecommendationData.recommendationOptions_3_performanceRisk,
      },
    ]
  }
}
