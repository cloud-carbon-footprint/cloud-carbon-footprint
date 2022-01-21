/*
 * © 2021 Thoughtworks, Inc.
 */

import { ListObjectsV2Output } from 'aws-sdk/clients/s3'

export const computeOptimizerBucketContentsList: ListObjectsV2Output = {
  Contents: [
    {
      Key: 'recommendations/asg/compute-optimizer/12345678/eu-west-3-2022-01-21T050006Z-acf12345-3067-7a13-4fc5-0b9b4f90f2cb.csv',
      LastModified: new Date('01-20-2022'),
      ETag: '365534jdfjndk7465ghhh',
      Size: 4130,
      StorageClass: 'STANDARD',
    },
    {
      Key: 'recommendations/asg/compute-optimizer/12345678/sa-east-1-2022-01-21T050030Z-e123a06b-4ae2-0e51-a27f-bff1ecb5173f.csv',
      LastModified: new Date('01-20-2022'),
      ETag: '365534jdfjndk7465ghhhanisbdj12',
      Size: 4130,
      StorageClass: 'STANDARD',
    },
  ],
  Name: 'ccf-co-recommendations-central',
}

// TODO: Change this to a csv format so that it returns csv file like the bucket would
export const computeOptimizerOverProvisioned = [
  {
    accountId: '1234567890',
    instanceArn:
      'arn:aws:ec2:eu-central-1:1234567890:instance/i-0c80d1b0f3a0c5c69', // get region from here and maybe resourceId
    instanceName: 'PA-VM-100 | Networks', //instance name
    currentInstanceType: 'm4.xlarge', //instance type
    finding: 'OVER_PROVISIONED', // type of recommendation
    current_vcpus: '4', // to get vcpu hours
    recommendations_count: '3', //**** maybe
    recommendationOptions_1_instanceType: 't3.xlarge', //recommended machine type
    recommendationOptions_2_instanceType: 'm5.xlarge', //recommended machine type
    recommendationOptions_1_estimatedMonthlySavings_value: '33.79', // cost savings in usd
    recommendationOptions_2_estimatedMonthlySavings_value: '7.04', // cost savings
  },
]
