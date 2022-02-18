/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  EC2RecommendationOption,
  getHoursInMonth,
} from '@cloud-carbon-footprint/common'
import { EC2ComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import ComputeOptimizerRecommendation from './ComputeOptimizerRecommendation'

export default class EC2TargetComputeOptimizerRecommendation extends ComputeOptimizerRecommendation {
  public instanceName: string
  public vCpuHours: number
  public instanceType: string
  public targetVcpus: string
  public usageAmount: number

  constructor(
    computeOptimizerRecommendationData: Partial<EC2ComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.instanceName = computeOptimizerRecommendationData.instanceName
    this.region = this.getRegion(computeOptimizerRecommendationData.instanceArn)
    this.resourceId = this.getResourceId(
      computeOptimizerRecommendationData.instanceArn,
    )
    this.recommendationOptions = [
      {
        instanceType:
          computeOptimizerRecommendationData.recommendationOptions_1_instanceType,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_1_estimatedMonthlySavings_value,
        performanceRisk:
          computeOptimizerRecommendationData.recommendationOptions_1_performanceRisk,
        vcpus: computeOptimizerRecommendationData.recommendationOptions_1_vcpus,
      },
      {
        instanceType:
          computeOptimizerRecommendationData.recommendationOptions_2_instanceType,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_2_estimatedMonthlySavings_value,
        performanceRisk:
          computeOptimizerRecommendationData.recommendationOptions_2_performanceRisk,
        vcpus: computeOptimizerRecommendationData.recommendationOptions_2_vcpus,
      },
      {
        instanceType:
          computeOptimizerRecommendationData.recommendationOptions_3_instanceType,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_3_estimatedMonthlySavings_value,
        performanceRisk:
          computeOptimizerRecommendationData.recommendationOptions_3_performanceRisk,
        vcpus: computeOptimizerRecommendationData.recommendationOptions_3_vcpus,
      },
    ]

    const optimalRecommendation = this.getOptimalRecommendation(
      this.recommendationOptions,
    ) as EC2RecommendationOption
    this.instanceType = optimalRecommendation.instanceType
    this.targetVcpus = optimalRecommendation.vcpus
    this.costSavings = parseFloat(optimalRecommendation.costSavings)
    this.vCpuHours = this.getVCpuHours(this.targetVcpus, this.instanceType)
    this.usageAmount = getHoursInMonth()
  }
}
