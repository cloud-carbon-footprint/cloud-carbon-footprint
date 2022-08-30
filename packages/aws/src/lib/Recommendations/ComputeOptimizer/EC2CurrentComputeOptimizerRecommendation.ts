/*
 * © 2021 Thoughtworks, Inc.
 */
import { getHoursInMonth } from '@cloud-carbon-footprint/common'
import { EC2ComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import {
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  INSTANCE_TYPE_GPU_PROCESSOR_MAPPING,
} from '../../AWSInstanceTypes'
import { COMPUTE_PROCESSOR_TYPES } from '@cloud-carbon-footprint/core'
import ComputeOptimizerRecommendationWithProcessors from './ComputeOptimizerRecommendationWithProcessors'

export default class EC2CurrentComputeOptimizerRecommendation extends ComputeOptimizerRecommendationWithProcessors {
  public instanceName: string
  public vCpuHours: number
  public instanceType: string
  public currentVcpus: string
  public usageAmount: number

  constructor(
    computeOptimizerRecommendationData: Partial<EC2ComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.instanceName = computeOptimizerRecommendationData.instanceName
    this.region = this.getRegion(computeOptimizerRecommendationData.instanceArn)
    this.type = `EC2-${computeOptimizerRecommendationData.finding}`
    this.resourceId = this.getResourceId(
      computeOptimizerRecommendationData.instanceArn,
    )
    this.instanceType = computeOptimizerRecommendationData.currentInstanceType
    this.description = this.instanceType
    this.currentVcpus = computeOptimizerRecommendationData.current_vcpus
    this.vCpuHours = this.getVCpuHours(this.currentVcpus, this.instanceType)
    this.usageAmount = getHoursInMonth()
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
