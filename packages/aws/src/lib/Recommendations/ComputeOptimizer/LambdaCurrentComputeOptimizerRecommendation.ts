/*
 * © 2021 Thoughtworks, Inc.
 */
import { LambdaComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import { getHoursInMonth } from '@cloud-carbon-footprint/common'
import ComputeOptimizerRecommendationWithProcessors from './ComputeOptimizerRecommendationWithProcessors'
import { COMPUTE_PROCESSOR_TYPES } from '@cloud-carbon-footprint/core'

export default class LambdaCurrentComputeOptimizerRecommendation extends ComputeOptimizerRecommendationWithProcessors {
  public functionVersion: string
  public memorySize: string
  public vCpus: string
  public vCpuHours: number
  public usageAmount: number

  constructor(
    computeOptimizerRecommendationData: Partial<LambdaComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.functionArn)
    this.type = `Lambda-${computeOptimizerRecommendationData.finding}`
    this.memorySize =
      computeOptimizerRecommendationData.currentConfiguration_memorySize
    this.description = `${this.memorySize}MB`
    this.functionVersion = computeOptimizerRecommendationData.functionVersion
    this.resourceId = this.getResourceId(
      computeOptimizerRecommendationData.functionArn,
    )
    this.vCpus = this.getVcpusForLambda(this.memorySize)
    this.vCpuHours = this.getVCpuHours(this.vCpus)
    this.usageAmount = getHoursInMonth()
    this.recommendationOptions = [
      {
        memorySize:
          computeOptimizerRecommendationData.recommendationOptions_1_configuration_memorySize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_1_estimatedMonthlySavings_value,
      },
      {
        memorySize:
          computeOptimizerRecommendationData.recommendationOptions_2_configuration_memorySize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_2_estimatedMonthlySavings_value,
      },
      {
        memorySize:
          computeOptimizerRecommendationData.recommendationOptions_3_configuration_memorySize,
        costSavings:
          computeOptimizerRecommendationData.recommendationOptions_3_estimatedMonthlySavings_value,
      },
    ]
  }

  public getResourceId(functionArn: string) {
    const functionData = functionArn.split(':')
    const name = functionData[functionData.length - 2]
    const version = functionData[functionData.length - 1]
    return `${name}:${version}`
  }

  public getVcpusForLambda(memorySize: string) {
    return (parseFloat(memorySize) / 1769).toString() //memory(MB) equivalent to 1 vcpu
  }

  // FIXME: this assumes that the lambda is running on x86, not ARM
  public getComputeProcessors(): string[] {
    return [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
  }

  public getGPUComputeProcessors(): string[] {
    return [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
  }
}
