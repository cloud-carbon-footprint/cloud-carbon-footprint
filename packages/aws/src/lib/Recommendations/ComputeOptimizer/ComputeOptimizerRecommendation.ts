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
  public resourceId: string
  public costSavings: number
  public recommendationOptions: ComputeOptimizerRecommendationOption[]
  public optimalRecommendation: any //TODO type this correctly

  protected constructor(init: Partial<ComputeOptimizerRecommendationData>) {
    Object.assign(this, init)

    this.accountName = this.accountId
    this.type = init.finding
  }

  public getRegion(resourceArn: string) {
    return resourceArn.split(':')[3]
  }

  public getResourceId(resourceArn: string) {
    return resourceArn.split('/').pop()
  }

  public getVCpuHours(currentVcpus: string, instanceType?: string): number {
    if (
      containsAny(
        Object.keys(BURSTABLE_INSTANCE_BASELINE_UTILIZATION),
        instanceType,
      )
    ) {
      return (
        ((parseFloat(currentVcpus) *
          BURSTABLE_INSTANCE_BASELINE_UTILIZATION[instanceType]) /
          AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020) *
        getHoursInMonth()
      )
    }
    // Multiply the number of virtual CPUS by the hours in a month
    return parseFloat(currentVcpus) * getHoursInMonth()
  }

  public getOptimalRecommendation(
    recommendationOptions: ComputeOptimizerRecommendationOption[],
    optimalPerformanceRiskLevel = 3,
  ): ComputeOptimizerRecommendationOption {
    return recommendationOptions.find(
      (recommendation: any) =>
        recommendation.performanceRisk <= optimalPerformanceRiskLevel,
    )
  }
}
