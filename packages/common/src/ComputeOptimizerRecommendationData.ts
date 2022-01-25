/*
 * © 2021 Thoughtworks, Inc.
 */

export interface ComputeOptimizerRecommendationData {
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

export type GetComputeOptimizerRecommendationsRequest = {
  Bucket: string
}
