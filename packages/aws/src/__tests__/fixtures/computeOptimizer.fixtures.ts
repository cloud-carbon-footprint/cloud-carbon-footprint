/*
 * © 2021 Thoughtworks, Inc.
 */

import { ListObjectsV2Output } from 'aws-sdk/clients/s3'

export const mockEC2ComputeOptimizerBucketList: ListObjectsV2Output = {
  Contents: [
    {
      Key: 'recommendations/asg/compute-optimizer/12345678/ap-northeast-2-2022-01-21T050030Z-e123a06b-4ae2-0e51-a27f-bff1ecb5173f.csv',
      LastModified: new Date('01-20-2022'),
      ETag: '123456jdfjndk7465gfffanisbdj12',
      Size: 4130,
      StorageClass: 'STANDARD',
    },
    {
      Key: 'recommendations/ec2/compute-optimizer/12345678/sa-east-1-2022-01-21T050030Z-e123a06b-4ae2-0e51-a27f-bff1ecb5173f.csv',
      LastModified: new Date('01-20-2022'),
      ETag: '365534jdfjndk7465ghhhanisbdj12',
      Size: 4130,
      StorageClass: 'STANDARD',
    },
  ],
  Name: 'test-bucket',
}

export const mockEBSComputeOptimizerBucketList: ListObjectsV2Output = {
  Contents: [
    {
      Key: 'recommendations/ebs/compute-optimizer/12345678/us-east-2-2022-01-21T050030Z-e123a06b-4ae2-0e51-a27f-bff1ecb5173f.csv',
      LastModified: new Date('01-20-2022'),
      ETag: '123456jdfjndk7465gfffanisbdj12',
      Size: 4130,
      StorageClass: 'STANDARD',
    },
  ],
  Name: 'test-bucket',
}

export const mockLambdaComputeOptimizerBucketList: ListObjectsV2Output = {
  Contents: [
    {
      Key: 'recommendations/lambda/compute-optimizer/12345678/us-east-2-2022-01-21T050030Z-e123a06b-4ae2-0e51-a27f-bff1ecb5173f.csv',
      LastModified: new Date('01-20-2022'),
      ETag: '123456jdfjndk7465gfffanisbdj12',
      Size: 4130,
      StorageClass: 'STANDARD',
    },
  ],
  Name: 'test-bucket',
}

export const ec2ComputeOptimizer = [
  {
    accountId: '1234567890',
    instanceArn:
      'arn:aws:ec2:eu-central-1:1234567890:instance/i-0c80d1b0f3a0c5c69',
    instanceName: 'PA-VM-100 | Networks',
    currentInstanceType: 'm4.xlarge',
    finding: 'OVER_PROVISIONED',
    current_vcpus: '4',
    recommendations_count: '3',
    recommendationOptions_1_instanceType: 't3.xlarge',
    recommendationOptions_2_instanceType: 'm5.xlarge',
    recommendationOptions_3_instanceType: 'r5n.large',
    recommendationOptions_1_estimatedMonthlySavings_value: '33.79',
    recommendationOptions_2_estimatedMonthlySavings_value: '7.04',
    recommendationOptions_3_estimatedMonthlySavings_value: '5.04',
    recommendationOptions_1_performanceRisk: '3.0',
    recommendationOptions_2_performanceRisk: '1.0',
    recommendationOptions_3_performanceRisk: '1.0',
    recommendationOptions_1_vcpus: '2',
    recommendationOptions_2_vcpus: '2',
    recommendationOptions_3_vcpus: '2',
  },
  {
    accountId: '1234567890',
    instanceArn:
      'arn:aws:ec2:eu-central-1:1234567890:instance/i-0c80d1b0f3a0c5c69',
    instanceName: 'PA-VM-100 | Networks',
    currentInstanceType: 'm4.xlarge',
    finding: 'OVER_PROVISIONED',
    current_vcpus: '4',
    recommendations_count: '3',
    recommendationOptions_1_instanceType: 't3.xlarge',
    recommendationOptions_2_instanceType: 'm5.xlarge',
    recommendationOptions_3_instanceType: 'r5n.large',
    recommendationOptions_1_estimatedMonthlySavings_value: '0',
    recommendationOptions_2_estimatedMonthlySavings_value: '7.04',
    recommendationOptions_3_estimatedMonthlySavings_value: '5.04',
    recommendationOptions_1_performanceRisk: '3.0',
    recommendationOptions_2_performanceRisk: '1.0',
    recommendationOptions_3_performanceRisk: '1.0',
    recommendationOptions_1_vcpus: '2',
    recommendationOptions_2_vcpus: '2',
    recommendationOptions_3_vcpus: '2',
  },
  {
    accountId: '1234567890',
    instanceArn:
      'arn:aws:ec2:eu-central-1:1234567890:instance/i-0c80d1b0f3a0c5c69',
    instanceName: 'PA-VM-100 | Networks',
    currentInstanceType: 'm4.xlarge',
    finding: 'UNDER_PROVISIONED',
    current_vcpus: '2',
    recommendations_count: '3',
    recommendationOptions_1_instanceType: 't3.xlarge',
    recommendationOptions_2_instanceType: 'm5.xlarge',
    recommendationOptions_3_instanceType: 'r5n.large',
    recommendationOptions_1_estimatedMonthlySavings_value: '13.79',
    recommendationOptions_2_estimatedMonthlySavings_value: '2.01',
    recommendationOptions_3_estimatedMonthlySavings_value: '5.01',
    recommendationOptions_1_performanceRisk: '1.0',
    recommendationOptions_2_performanceRisk: '1.0',
    recommendationOptions_3_performanceRisk: '3.0',
    recommendationOptions_1_vcpus: '2',
    recommendationOptions_2_vcpus: '2',
    recommendationOptions_3_vcpus: '2',
  },
  {
    accountId: '1234567890',
    instanceArn:
      'arn:aws:ec2:eu-central-1:1234567890:instance/i-0c80d1b0f3a0c5c69',
    instanceName: 'PA-VM-100 | Networks',
    currentInstanceType: 'm4.xlarge',
    finding: 'OPTIMIZED',
    current_vcpus: '3',
    recommendations_count: '3',
    recommendationOptions_1_instanceType: 't3.xlarge',
    recommendationOptions_2_instanceType: 'm5.xlarge',
    recommendationOptions_3_instanceType: 'r5n.large',
    recommendationOptions_1_estimatedMonthlySavings_value: '88.79',
    recommendationOptions_2_estimatedMonthlySavings_value: '17.34',
    recommendationOptions_3_estimatedMonthlySavings_value: '5.01',
    recommendationOptions_1_performanceRisk: '1.0',
    recommendationOptions_2_performanceRisk: '1.0',
    recommendationOptions_3_performanceRisk: '3.0',
    recommendationOptions_1_vcpus: '2',
    recommendationOptions_2_vcpus: '2',
    recommendationOptions_3_vcpus: '2',
  },
]

export const asgComputeOptimizer = [
  {
    accountId: '1234567890',
    autoScalingGroupArn:
      'arn:aws:autoscaling:ap-south-1:1234567890:autoScalingGroup:6b23335d-1234-46ea-8365-aad08e461d27:autoScalingGroupName/eksctl-emr-on-eks-ebs-encryption-spike-nodegroup-ng-2-workers-NodeGroup-8T4T8GM1AO',
    currentConfiguration_instanceType: 'm4.xlarge',
    finding: 'NOT_OPTIMIZED',
    current_vcpus: '4',
    recommendations_count: '3',
    recommendationOptions_1_configuration_instanceType: 'r5.large',
    recommendationOptions_2_configuration_instanceType: 'r5n.large',
    recommendationOptions_1_estimatedMonthlySavings_value: '51.47',
    recommendationOptions_2_estimatedMonthlySavings_value: '35.03',
  },
]

export const ebsComputeOptimizer = [
  {
    accountId: '1234567890',
    volumeArn:
      'arn:aws:ec2:us-west-2:123456789012:volume/vol-00e39f1234a7eadfb',
    currentConfiguration_instanceType: 'm4.xlarge',
    finding: 'NotOptimized',
    current_monthlyPrice: '8.0',
    currentConfiguration_volumeType: 'gp2',
    currentConfiguration_volumeSize: '80',
    recommendations_count: '2',
    recommendationOptions_1_configuration_volumeType: 'gp3',
    recommendationOptions_1_configuration_volumeSize: '50',
    recommendationOptions_2_configuration_volumeType: 'gp2',
    recommendationOptions_2_configuration_volumeSize: '80',
    recommendationOptions_3_configuration_volumeType: '',
    recommendationOptions_3_configuration_volumeSize: '',
    recommendationOptions_1_estimatedMonthlySavings_value: '6.2',
    recommendationOptions_2_estimatedMonthlySavings_value: '8',
    recommendationOptions_3_estimatedMonthlySavings_value: '',
    recommendationOptions_1_performanceRisk: '1.0',
    recommendationOptions_2_performanceRisk: '2.0',
    recommendationOptions_3_performanceRisk: '1.0',
  },
  {
    accountId: '1234567890',
    volumeArn:
      'arn:aws:ec2:us-west-2:123456789012:volume/vol-00e39f1234a7eaqrt',
    currentConfiguration_instanceType: 'm4.xlarge',
    finding: 'NotOptimized',
    current_monthlyPrice: '8.0',
    currentConfiguration_volumeType: 'st1',
    currentConfiguration_volumeSize: '80',
    recommendations_count: '2',
    recommendationOptions_1_configuration_volumeType: 'st1',
    recommendationOptions_1_configuration_volumeSize: '50',
    recommendationOptions_2_configuration_volumeType: 'sc1',
    recommendationOptions_2_configuration_volumeSize: '80',
    recommendationOptions_3_configuration_volumeType: '',
    recommendationOptions_3_configuration_volumeSize: '',
    recommendationOptions_1_estimatedMonthlySavings_value: '0',
    recommendationOptions_2_estimatedMonthlySavings_value: '8',
    recommendationOptions_3_estimatedMonthlySavings_value: '',
    recommendationOptions_1_performanceRisk: '1.0',
    recommendationOptions_2_performanceRisk: '2.0',
    recommendationOptions_3_performanceRisk: '1.0',
  },
  {
    accountId: '1234567890',
    volumeArn:
      'arn:aws:ec2:us-west-2:123456789012:volume/vol-00e39f1234a7eadfb',
    currentConfiguration_instanceType: 'm4.xlarge',
    finding: 'Optimized',
    current_monthlyPrice: '8.0',
    currentConfiguration_volumeType: 'gp2',
    currentConfiguration_volumeSize: '80',
    recommendations_count: '2',
    recommendationOptions_1_configuration_volumeType: 'gp3',
    recommendationOptions_1_configuration_volumeSize: '80',
    recommendationOptions_2_configuration_volumeType: 'gp2',
    recommendationOptions_2_configuration_volumeSize: '80',
    recommendationOptions_1_estimatedMonthlySavings_value: '6.2',
    recommendationOptions_2_estimatedMonthlySavings_value: '8',
    recommendationOptions_1_performanceRisk: '3.0',
    recommendationOptions_2_performanceRisk: '1.0',
    recommendationOptions_3_performanceRisk: '1.0',
  },
]

export const lambdaComputeOptimizer = [
  {
    accountId: '1234567890',
    functionArn:
      'arn:aws:lambda:us-east-2:1234567890:function:api-user-prod-add_user:$LATEST',
    finding: 'NotOptimized',
    functionVersion: '$LATEST',
    currentConfiguration_memorySize: '1024',
    recommendations_count: '1',
    recommendationOptions_1_configuration_memorySize: '848',
    recommendationOptions_2_configuration_memorySize: '',
    recommendationOptions_3_configuration_memorySize: '',
    recommendationOptions_1_estimatedMonthlySavings_value: '2.988E-04',
    recommendationOptions_2_estimatedMonthlySavings_value: '',
    recommendationOptions_3_estimatedMonthlySavings_value: '',
  },
  {
    accountId: '1234567890',
    functionArn:
      'arn:aws:lambda:us-east-2:1234567890:function:api-user-prod-add_user:$LATEST',
    finding: 'NotOptimized',
    functionVersion: '$LATEST',
    currentConfiguration_memorySize: '1024',
    recommendations_count: '1',
    recommendationOptions_1_configuration_memorySize: '848',
    recommendationOptions_2_configuration_memorySize: '',
    recommendationOptions_3_configuration_memorySize: '',
    recommendationOptions_1_estimatedMonthlySavings_value: '',
    recommendationOptions_2_estimatedMonthlySavings_value: '',
    recommendationOptions_3_estimatedMonthlySavings_value: '',
  },
  {
    accountId: '1234567890',
    functionArn:
      'arn:aws:lambda:us-east-2:1234567890:function:sumo-webhook-prod:$LATEST',
    finding: 'Optimized',
    functionVersion: '$LATEST',
    currentConfiguration_memorySize: '1024',
    recommendations_count: '0',
    recommendationOptions_1_configuration_memorySize: '',
    recommendationOptions_2_configuration_memorySize: '',
    recommendationOptions_3_configuration_memorySize: '',
    recommendationOptions_1_estimatedMonthlySavings_value: '',
    recommendationOptions_2_estimatedMonthlySavings_value: '',
    recommendationOptions_3_estimatedMonthlySavings_value: '',
  },
]
