/*
 * © 2021 Thoughtworks, Inc.
 */
import { EBSComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import EBSCurrentComputeOptimizerRecommendation from './EBSCurrentComputeOptimizerRecommendation'

export default class EBSTargetComputeOptimizerRecommendation extends EBSCurrentComputeOptimizerRecommendation {
  constructor(
    computeOptimizerRecommendationData: Partial<EBSComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.region = this.getRegion(computeOptimizerRecommendationData.volumeArn)
    this.optimalRecommendation = this.getOptimalRecommendation(
      this.recommendationOptions,
    )
    this.volumeType = this.optimalRecommendation.volumeType
    this.volumeSize = parseInt(this.optimalRecommendation.volumeSize)
    this.costSavings = this.optimalRecommendation.costSavings
  }
}
