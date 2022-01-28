/*
 * © 2021 Thoughtworks, Inc.
 */

export interface EC2ComputeOptimizerRecommendationData {
  accountId: string
  currentInstanceType: string
  current_vcpus: string
  finding: string
  instanceName: string
  instanceArn: string
  recommendations_count: string
  recommendationOptions_1_instanceType: string
  recommendationOptions_2_instanceType: string
  recommendationOptions_3_instanceType: string
  recommendationOptions_1_estimatedMonthlySavings_value: string
  recommendationOptions_2_estimatedMonthlySavings_value: string
  recommendationOptions_3_estimatedMonthlySavings_value: string
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
}

export type GetComputeOptimizerRecommendationsRequest = {
  Bucket: string
}
