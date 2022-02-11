/*
 * © 2021 Thoughtworks, Inc.
 */
import { getHoursInMonth } from '@cloud-carbon-footprint/common'
import { EC2ComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import EC2CurrentComputeOptimizerRecommendation from './EC2CurrentComputeOptimizerRecommendation'

export default class EC2TargetComputeOptimizerRecommendation extends EC2CurrentComputeOptimizerRecommendation {
  constructor(
    computeOptimizerRecommendationData: Partial<EC2ComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.instanceArn)
    this.optimalRecommendation = this.getOptimalRecommendation(
      this.recommendationOptions,
    )
    this.instanceType = this.optimalRecommendation.instanceType
    this.currentVcpus = this.optimalRecommendation.Vcpu
    this.costSavings = this.optimalRecommendation.costSavings
    this.vCpuHours = this.getVCpuHours(this.currentVcpus, this.instanceType)
    this.usageAmount = getHoursInMonth()
  }
}
