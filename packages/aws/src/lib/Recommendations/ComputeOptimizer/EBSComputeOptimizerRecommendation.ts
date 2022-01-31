/*
 * © 2021 Thoughtworks, Inc.
 */
import { EBSRecommendationOption } from '@cloud-carbon-footprint/common'
import { EBSComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import ComputeOptimizerRecommendation from './ComputeOptimizerRecommendation'

export default class EBSComputeOptimizerRecommendation extends ComputeOptimizerRecommendation {
  public accountId: string
  public accountName: string
  public region: string
  public type: string
  public resourceId: string
  public currentCost: string
  public volumeType: string
  public volumeSize: string
  public recommendationOptions: EBSRecommendationOption[]

  constructor(
    computeOptimizerRecommendationData: Partial<EBSComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.volumeArn)
    this.type = `EBS-${computeOptimizerRecommendationData.finding}`
    this.currentCost = computeOptimizerRecommendationData.current_monthlyPrice
    this.volumeType =
      computeOptimizerRecommendationData.currentConfiguration_volumeType
    this.volumeSize =
      computeOptimizerRecommendationData.currentConfiguration_volumeSize
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
      },
      {
        volumeType:
          computeOptimizerRecommendationData.recommendationOptions_2_configuration_volumeType,
        volumeSize:
          computeOptimizerRecommendationData.recommendationOptions_2_configuration_volumeSize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_2_estimatedMonthlySavings_value,
      },
      {
        volumeType:
          computeOptimizerRecommendationData.recommendationOptions_3_configuration_volumeType,
        volumeSize:
          computeOptimizerRecommendationData.recommendationOptions_3_configuration_volumeSize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_3_estimatedMonthlySavings_value,
      },
    ]
  }
}
