/*
 * © 2021 Thoughtworks, Inc.
 */
import { LambdaComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import LambdaCurrentComputeOptimizerRecommendation from './LambdaCurrentComputeOptimizerRecommendation'
import {
  ComputeOptimizerRecommendationOption,
  getHoursInMonth,
} from '@cloud-carbon-footprint/common'

export default class LambdaTargetComputeOptimizerRecommendation extends LambdaCurrentComputeOptimizerRecommendation {
  constructor(
    computeOptimizerRecommendationData: Partial<LambdaComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.functionArn)
    this.optimalRecommendation = this.getOptimalRecommendation(
      this.recommendationOptions,
    )
    this.memorySize = this.optimalRecommendation.memorySize
    this.Vcpus = this.getVcpusForLambda(this.memorySize)
    this.costSavings = this.optimalRecommendation.costSavings
    this.vCpuHours = this.getVCpuHours(this.Vcpus)
    this.usageAmount = getHoursInMonth()
  }

  public getOptimalRecommendation(
    recommendationOptions: ComputeOptimizerRecommendationOption[],
  ): ComputeOptimizerRecommendationOption {
    return recommendationOptions[0]
  }
}
