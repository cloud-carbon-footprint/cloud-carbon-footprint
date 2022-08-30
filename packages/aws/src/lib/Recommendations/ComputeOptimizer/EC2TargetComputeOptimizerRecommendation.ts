/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  EC2RecommendationOption,
  getHoursInMonth,
} from '@cloud-carbon-footprint/common'
import { EC2ComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import {
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  INSTANCE_TYPE_GPU_PROCESSOR_MAPPING,
} from '../../AWSInstanceTypes'
import { COMPUTE_PROCESSOR_TYPES } from '@cloud-carbon-footprint/core'
import ComputeOptimizerRecommendationWithProcessors from './ComputeOptimizerRecommendationWithProcessors'

export default class EC2TargetComputeOptimizerRecommendation extends ComputeOptimizerRecommendationWithProcessors {
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
    this.description = this.instanceType
    this.targetVcpus = optimalRecommendation.vcpus
    this.costSavings = parseFloat(optimalRecommendation.costSavings)
    this.vCpuHours = this.getVCpuHours(this.targetVcpus, this.instanceType)
    this.usageAmount = getHoursInMonth()
  }

  public getComputeProcessors(): string[] {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[this.instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  public getGPUComputeProcessors(): string[] {
    return (
      INSTANCE_TYPE_GPU_PROCESSOR_MAPPING[this.instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }
}
