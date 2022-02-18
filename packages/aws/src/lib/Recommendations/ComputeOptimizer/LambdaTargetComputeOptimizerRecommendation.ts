/*
 * © 2021 Thoughtworks, Inc.
 */
import { LambdaComputeOptimizerRecommendationData } from './ComputeOptimizerRecommendationData'
import {
  getHoursInMonth,
  LambdaRecommendationOption,
} from '@cloud-carbon-footprint/common'
import ComputeOptimizerRecommendation from './ComputeOptimizerRecommendation'

export default class LambdaTargetComputeOptimizerRecommendation extends ComputeOptimizerRecommendation {
  public functionVersion: string
  public memorySize: string
  public targetVcpus: string
  public vCpuHours: number
  public usageAmount: number

  constructor(
    computeOptimizerRecommendationData: Partial<LambdaComputeOptimizerRecommendationData>,
  ) {
    super(computeOptimizerRecommendationData)

    this.accountName = this.accountId
    this.region = this.getRegion(computeOptimizerRecommendationData.functionArn)
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

    this.optimalRecommendation = this
      .recommendationOptions[0] as LambdaRecommendationOption
    this.resourceId = this.getResourceId(
      computeOptimizerRecommendationData.functionArn,
    )
    this.memorySize = this.optimalRecommendation.memorySize
    this.targetVcpus = this.getVcpusForLambda(this.memorySize)
    this.costSavings = parseFloat(this.optimalRecommendation.costSavings)
    this.vCpuHours = this.getVCpuHours(this.targetVcpus)
    this.usageAmount = getHoursInMonth()
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
}
