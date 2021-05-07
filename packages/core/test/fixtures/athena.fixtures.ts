/*
 * © 2021 ThoughtWorks, Inc.
 */

import { Athena } from 'aws-sdk'

const queryResultsHeaders = {
  Data: [
    { VarCharValue: 'timestamp' },
    { VarCharValue: 'accountName' },
    { VarCharValue: 'region' },
    { VarCharValue: 'serviceName' },
    { VarCharValue: 'usageType' },
    { VarCharValue: 'usageUnit' },
    { VarCharValue: 'vCpus' },
    { VarCharValue: 'usageAmount' },
    { VarCharValue: 'cost' },
  ],
}

const queryResultsDataOne = [
  {
    Data: [
      { VarCharValue: '2020-11-02' },
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-2' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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

export const athenaMockGetQueryResultsWithNetworkingGlueECSDynamoDB: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataThree],
  },
}

const queryResultsDataFour = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
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
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEKS' },
      { VarCharValue: 'APE1-AmazonEKS-Hours:perCluster' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '2' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonMSK' },
      { VarCharValue: 'APS1-Kafka.m5.large' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '4' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRoute53' },
      { VarCharValue: 'APS1-ResolverNetworkInterface' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '4' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: '8icvdraalzbfrdevgamoddblf' },
      { VarCharValue: 'APS3-SoftwareUsage:t2.small' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '4' },
    ],
  },
]

export const athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataFive],
  },
}

const queryResultsDataSix = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS1-InstanceUsage:db.r5.large' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '2' },
      { VarCharValue: '30' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-EBSOptimized:c5.2xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '8' },
      { VarCharValue: '4' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APN1-SpotUsage:c5.12xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '48' },
      { VarCharValue: '12' },
      { VarCharValue: '25' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonSimpleDB' },
      { VarCharValue: 'APN1-BoxUsage' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '20' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'ElasticMapReduce' },
      { VarCharValue: 'APN1-BoxUsage:m5.xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '4' },
      { VarCharValue: '6' },
      { VarCharValue: '20' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-CPUCredits:t3' },
      { VarCharValue: 'vCPU-Hours' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '20' },
    ],
  },
]

export const athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataSix],
  },
}

const queryResultsDataSeven = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonRedshift' },
      { VarCharValue: 'RMS:ra3.4xlarge' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRedshift' },
      { VarCharValue: 'CS:ra3.4xlarge' },
      { VarCharValue: 'seconds' },
      { VarCharValue: '' },
      { VarCharValue: '10' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-BoxUsage:t3.2xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '8' },
      { VarCharValue: '88' },
      { VarCharValue: '15' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'USE2-Aurora:ServerlessUsage' },
      { VarCharValue: 'ACU-Hr' },
      { VarCharValue: '' },
      { VarCharValue: '32' },
      { VarCharValue: '15' },
    ],
  },
]

export const athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataSeven],
  },
}

const queryResultsDataEight = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-USE1-AWS-Out-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '1574' },
      { VarCharValue: '22' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonCloudWatch' },
      { VarCharValue: 'APN2-DataScanned-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonCloudFront' },
      { VarCharValue: 'US-DataTransfer-Out-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '2000' },
      { VarCharValue: '10' },
    ],
  },
]

export const athenaMockGetQueryResultsNetworking: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataEight],
  },
}

const queryResultsDataNine = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-SpotUsage:t3.micro' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '2' },
      { VarCharValue: '17' },
      { VarCharValue: '25' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-SpotUsage:m5.xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '2' },
      { VarCharValue: '15' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-SpotUsage:c5d.4xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '2' },
      { VarCharValue: '13' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-SpotUsage:m5zn.2xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '8' },
      { VarCharValue: '12' },
      { VarCharValue: '7' },
    ],
  },
]

export const athenaMockGetQueryResultsMemory: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataNine],
  },
}
