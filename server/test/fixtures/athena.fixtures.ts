/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { Athena } from 'aws-sdk'

const queryResultsHeaders = {
  Data: [
    { VarCharValue: 'day' },
    { VarCharValue: 'line_item_usage_account_id' },
    { VarCharValue: 'product_region' },
    { VarCharValue: 'line_item_product_code' },
    { VarCharValue: 'line_item_usage_type' },
    { VarCharValue: 'pricing_unit' },
    { VarCharValue: 'product_vcpu' },
    { VarCharValue: 'total_line_item_usage_amount' },
    { VarCharValue: 'total_cost' },
  ],
}

const queryResultsDataOne = [
  {
    Data: [
      { VarCharValue: '2020-11-02' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '1' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-11-02' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '2' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-11-02' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '3' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-11-03' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '4' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-29' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'EBS:VolumeUsage.gp2' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '3' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW1-EBS:SnapshotUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '6' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AWSLambda' },
      { VarCharValue: 'Lambda-GB-Second' },
      { VarCharValue: 'seconds' },
      { VarCharValue: '' },
      { VarCharValue: '10' },
      { VarCharValue: '7' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AWSLambda' },
      { VarCharValue: 'Lambda-GB-Second' },
      { VarCharValue: 'seconds' },
      { VarCharValue: '' },
      { VarCharValue: '10' },
      { VarCharValue: '8' },
    ],
  },
]

export const athenaMockGetQueryResultsWithEC2EBSLambda: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataOne],
  },
}

const queryResultsDataTwo = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '9' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonCloudWatch' },
      { VarCharValue: 'USE1-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '4' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'RDS:StorageUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '11' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'RDS:GP2-Storage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '12' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'InstanceUsage:db.t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '13' },
    ],
  },
]

export const athenaMockGetQueryResultsWithS3CloudWatchRDS: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataTwo],
  },
}

const queryResultsDataThree = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-NatGateway-Hours' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AWSGlue' },
      { VarCharValue: 'APS1-Crawler-DPU-Hour' },
      { VarCharValue: 'DPU-Hour' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonECS' },
      { VarCharValue: 'APN1-ECS-EC2-GB-Hours' },
      { VarCharValue: 'GB-Hours' },
      { VarCharValue: '' },
      { VarCharValue: '12' },
      { VarCharValue: '7' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-31' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonDynamoDB' },
      { VarCharValue: 'APS1-TimedBackupStorage-ByteHrs' },
      { VarCharValue: 'GB-Month' },
      { VarCharValue: '' },
      { VarCharValue: '10000000000' },
      { VarCharValue: '13' },
    ],
  },
]

export const athenaMockGetQueryResultsWithNetworkingGlueECS: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataThree],
  },
}

const queryResultsDataFour = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonKinesisAnalytics' },
      { VarCharValue: 'APS1-RunningApplicationStorage' },
      { VarCharValue: 'GB-month' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '456' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonKinesisAnalytics' },
      { VarCharValue: 'APS2-DurableApplicationBackups' },
      { VarCharValue: 'GB-month' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '456' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonES' },
      { VarCharValue: 'USE2-ES:GP2-Storage' },
      { VarCharValue: 'GB-Mp' },
      { VarCharValue: '' },
      { VarCharValue: '37' },
      { VarCharValue: '73' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-31' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APN1-SpotUsage:c5.18xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '' },
      { VarCharValue: '3' },
      { VarCharValue: '10' },
    ],
  },
]

export const athenaMockGetQueryResultsWithKenesisESAndEc2Spot: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataFour],
  },
}

const queryResultsDataFive = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonECS' },
      { VarCharValue: 'APN1-Fargate-GB-Hours' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '11' },
      { VarCharValue: '2' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonECS' },
      { VarCharValue: 'APN1-Fargate-vCPU-Hours:perCPU' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '2' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '921261756131' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEKS' },
      { VarCharValue: 'APE1-AmazonEKS-Hours:perCluster' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '2' },
    ],
  },
]

export const athenaMockGetQueryResultsWithECS: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataFive],
  },
}
