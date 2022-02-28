/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  ComputeOptimizerRecommendationOption,
  containsAny,
  getHoursInMonth,
} from '@cloud-carbon-footprint/common'
import { ComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import { BURSTABLE_INSTANCE_BASELINE_UTILIZATION } from '../../AWSInstanceTypes'
import { AWS_CLOUD_CONSTANTS } from '../../../domain'

export default class ComputeOptimizerRecommendation {
  public accountId: string
  public accountName: string
  public region: string
  public type: string
  public description: string
  public resourceId: string
  public costSavings: number
  public recommendationOptions: ComputeOptimizerRecommendationOption[]

  protected constructor(init: Partial<ComputeOptimizerRecommendationData>) {
    this.accountId = init.accountId
    this.accountName = this.accountId
    this.type = init.finding
  }

  public getRegion(resourceArn: string) {
    return resourceArn.split(':')[3]
  }

  public getResourceId(resourceArn: string) {
    return resourceArn.split('/').pop()
  }

  public getVCpuHours(vcpus: string, instanceType?: string): number {
    if (
      containsAny(
        Object.keys(BURSTABLE_INSTANCE_BASELINE_UTILIZATION),
        instanceType,
      )
    ) {
      return (
        ((parseFloat(vcpus) *
          BURSTABLE_INSTANCE_BASELINE_UTILIZATION[instanceType]) /
          AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020) *
        getHoursInMonth()
      )
    }
    // Multiply the number of virtual CPUS by the hours in a month
    return parseFloat(vcpus) * getHoursInMonth()
  }

  public getOptimalRecommendation(
    recommendationOptions: ComputeOptimizerRecommendationOption[],
  ): ComputeOptimizerRecommendationOption {
    const optimalPerformanceRiskLevel = 3
    return recommendationOptions.find(
      (recommendation: ComputeOptimizerRecommendationOption) =>
        parseFloat(recommendation.performanceRisk) <=
        optimalPerformanceRiskLevel,
    )
  }
}
