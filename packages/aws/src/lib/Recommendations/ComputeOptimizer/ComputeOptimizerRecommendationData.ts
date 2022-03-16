/*
 * © 2021 Thoughtworks, Inc.
 */

export interface ComputeOptimizerRecommendationData {
  accountId: string
  finding: string
  recommendations_count: string
  recommendationOptions_1_estimatedMonthlySavings_value: string
  recommendationOptions_2_estimatedMonthlySavings_value: string
  recommendationOptions_3_estimatedMonthlySavings_value: string
  recommendationOptions_1_performanceRisk: string
  recommendationOptions_2_performanceRisk: string
  recommendationOptions_3_performanceRisk: string
}

export interface EC2ComputeOptimizerRecommendationData {
  accountId: string
  currentInstanceType: string
  current_vcpus: string
  finding: string
  instanceName: string
  instanceArn: string
  vCpuHours: number
  recommendations_count: string
  recommendationOptions_1_instanceType: string
  recommendationOptions_2_instanceType: string
  recommendationOptions_3_instanceType: string
  recommendationOptions_1_estimatedMonthlySavings_value: string
  recommendationOptions_2_estimatedMonthlySavings_value: string
  recommendationOptions_3_estimatedMonthlySavings_value: string
  recommendationOptions_1_performanceRisk: string
  recommendationOptions_2_performanceRisk: string
  recommendationOptions_3_performanceRisk: string
  recommendationOptions_1_vcpus: string
  recommendationOptions_2_vcpus: string
  recommendationOptions_3_vcpus: string
}

export interface EBSComputeOptimizerRecommendationData {
  accountId: string
  volumeArn: string
  currentConfiguration_instanceType: string
  finding: string
  current_monthlyPrice: string
  currentConfiguration_volumeType: string
  currentConfiguration_volumeSize: string
  recommendations_count: string
  recommendationOptions_1_configuration_volumeType: string
  recommendationOptions_1_configuration_volumeSize: string
  recommendationOptions_1_estimatedMonthlySavings_value: string
  recommendationOptions_2_configuration_volumeType: string
  recommendationOptions_2_configuration_volumeSize: string
  recommendationOptions_2_estimatedMonthlySavings_value: string
  recommendationOptions_3_configuration_volumeType: string
  recommendationOptions_3_configuration_volumeSize: string
  recommendationOptions_3_estimatedMonthlySavings_value: string
  recommendationOptions_1_performanceRisk: string
  recommendationOptions_2_performanceRisk: string
  recommendationOptions_3_performanceRisk: string
}

export interface LambdaComputeOptimizerRecommendationData {
  accountId: string
  functionArn: string
  functionName: string
  finding: string
  functionVersion: string
  currentConfiguration_memorySize: string
  currentConfiguration_timeout: string
  recommendations_count: string
  recommendationOptions_1_configuration_memorySize: string
  recommendationOptions_1_estimatedMonthlySavings_value: string
  recommendationOptions_2_configuration_memorySize: string
  recommendationOptions_2_estimatedMonthlySavings_value: string
  recommendationOptions_3_configuration_memorySize: string
  recommendationOptions_3_estimatedMonthlySavings_value: string
}

export type GetComputeOptimizerRecommendationsRequest = {
  Bucket: string
}
