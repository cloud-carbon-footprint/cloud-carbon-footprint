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
    ],
  },
]

export const athenaMockGetQueryResultsWithS3CloudWatchRDS: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataTwo],
  },
}
