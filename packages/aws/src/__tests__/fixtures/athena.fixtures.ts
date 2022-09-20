/*
 * © 2021 Thoughtworks, Inc.
 */

import { Athena } from 'aws-sdk'

export const testAccountId = '123456789'

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
    { VarCharValue: 'resource_tags_user_environment' },
    { VarCharValue: 'resource_tags_aws_created_by' },
  ],
}

const queryResultsDataOne = [
  {
    Data: [
      { VarCharValue: '2020-11-02' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '1' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-11-02' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '2' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-11-02' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '3' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-11-03' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '4' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-29' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'EBS:VolumeUsage.gp2' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '3' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW1-EBS:SnapshotUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '6' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AWSLambda' },
      { VarCharValue: 'Lambda-GB-Second' },
      { VarCharValue: 'seconds' },
      { VarCharValue: '' },
      { VarCharValue: '10' },
      { VarCharValue: '7' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AWSLambda' },
      { VarCharValue: 'Lambda-GB-Second' },
      { VarCharValue: 'seconds' },
      { VarCharValue: '' },
      { VarCharValue: '10' },
      { VarCharValue: '8' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithEC2EBSLambda: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataOne],
    },
  }

const queryResultsDataTwo = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '9' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonCloudWatch' },
      { VarCharValue: 'USE1-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '4' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'RDS:StorageUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '11' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'RDS:GP2-Storage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '12' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-2' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'InstanceUsage:db.t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '13' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithS3CloudWatchRDS: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataTwo],
    },
  }

const queryResultsDataThree = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-NatGateway-Hours' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AWSGlue' },
      { VarCharValue: 'APS1-Crawler-DPU-Hour' },
      { VarCharValue: 'DPU-Hour' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonECS' },
      { VarCharValue: 'APN1-ECS-EC2-GB-Hours' },
      { VarCharValue: 'GB-Hours' },
      { VarCharValue: '' },
      { VarCharValue: '12' },
      { VarCharValue: '7' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-31' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonDynamoDB' },
      { VarCharValue: 'APS1-TimedBackupStorage-ByteHrs' },
      { VarCharValue: 'GB-Month' },
      { VarCharValue: '' },
      { VarCharValue: '10000000000' },
      { VarCharValue: '13' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithNetworkingGlueECSDynamoDB: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataThree],
    },
  }

const queryResultsDataFour = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonKinesisAnalytics' },
      { VarCharValue: 'APS1-RunningApplicationStorage' },
      { VarCharValue: 'GB-month' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '456' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonKinesisAnalytics' },
      { VarCharValue: 'APS2-DurableApplicationBackups' },
      { VarCharValue: 'GB-month' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '456' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonES' },
      { VarCharValue: 'USE2-ES:GP2-Storage' },
      { VarCharValue: 'GB-Mp' },
      { VarCharValue: '' },
      { VarCharValue: '37' },
      { VarCharValue: '73' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-31' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APN1-SpotUsage:c5.18xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '' },
      { VarCharValue: '3' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-31' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonES' },
      { VarCharValue: 'EUC1-HeavyUsage:t3.medium.elasticsearch' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '' },
      { VarCharValue: '3' },
      { VarCharValue: '14' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithKinesisESAndEc2Spot: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataFour],
    },
  }

const queryResultsDataFive = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonECS' },
      { VarCharValue: 'APN1-Fargate-GB-Hours' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '11' },
      { VarCharValue: '2' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonECS' },
      { VarCharValue: 'APN1-Fargate-vCPU-Hours:perCPU' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '2' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEKS' },
      { VarCharValue: 'APE1-AmazonEKS-Hours:perCluster' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '2' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonMSK' },
      { VarCharValue: 'APS1-Kafka.m5.large' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '4' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonMSK' },
      { VarCharValue: 'APS3-Kafka.t3.small' },
      { VarCharValue: 'hours' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '4' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRoute53' },
      { VarCharValue: 'APS1-ResolverNetworkInterface' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '4' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: '8icvdraalzbfrdevgamoddblf' },
      { VarCharValue: 'APS3-SoftwareUsage:t2.small' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '4' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithECSEksKafkaAndUnknownServices: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataFive],
    },
  }

const queryResultsDataSix = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS1-InstanceUsage:db.r5.large' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '2' },
      { VarCharValue: '30' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-EBSOptimized:c5.2xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '8' },
      { VarCharValue: '4' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APN1-SpotUsage:c5.12xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '48' },
      { VarCharValue: '12' },
      { VarCharValue: '25' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonSimpleDB' },
      { VarCharValue: 'APN1-BoxUsage' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '20' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'ElasticMapReduce' },
      { VarCharValue: 'APN1-BoxUsage:m5.xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '4' },
      { VarCharValue: '6' },
      { VarCharValue: '20' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-CPUCredits:t3' },
      { VarCharValue: 'vCPU-Hours' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '20' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithDocDBComputeEbsOptimizedSpotUsage: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataSix],
    },
  }

const queryResultsDataSeven = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonRedshift' },
      { VarCharValue: 'RMS:ra3.4xlarge' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRedshift' },
      { VarCharValue: 'CS:ra3.4xlarge' },
      { VarCharValue: 'seconds' },
      { VarCharValue: '' },
      { VarCharValue: '10' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-BoxUsage:t3.2xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '8' },
      { VarCharValue: '88' },
      { VarCharValue: '15' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'USE2-Aurora:ServerlessUsage' },
      { VarCharValue: 'ACU-Hr' },
      { VarCharValue: '' },
      { VarCharValue: '32' },
      { VarCharValue: '15' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithRedshiftStorageComputeSavingsPlan: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataSeven],
    },
  }

const queryResultsDataEight = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-USE1-AWS-Out-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '1574' },
      { VarCharValue: '22' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonCloudWatch' },
      { VarCharValue: 'APN2-DataScanned-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonCloudFront' },
      { VarCharValue: 'US-DataTransfer-Out-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '2000' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsNetworking: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataEight],
    },
  }

const queryResultsDataNine = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-SpotUsage:t3.micro' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '2' },
      { VarCharValue: '17' },
      { VarCharValue: '25' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-SpotUsage:m5.xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '2' },
      { VarCharValue: '15' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-SpotUsage:c5d.4xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '2' },
      { VarCharValue: '13' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-SpotUsage:m5zn.2xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '8' },
      { VarCharValue: '12' },
      { VarCharValue: '7' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsMemory: Athena.GetQueryResultsOutput = {
  ResultSet: {
    Rows: [queryResultsHeaders, ...queryResultsDataNine],
  },
}

const queryResultsDataTen = [
  {
    Data: [
      { VarCharValue: '2021-01-02' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'USE1-BytesDeleted-STANDARD' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0253623422' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-03' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'USE1-BytesDeleted-SIA' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.023462346' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-04' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-north-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'EUN1-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: testAccountId },
      { VarCharValue: '7' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-05' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-GDA-Staging' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.06434566' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-06' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-ZIA-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '465759470' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-07' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-RRS-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '876543637' },
      { VarCharValue: '7' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsS3WithReplicationFactors: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataTen],
    },
  }

const queryResultsDataEleven = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APS3-EBS:VolumeUsage.gp2' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '23.9310345' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APS3-EBS:SnapshotUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '23.9310345' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonEFS' },
      { VarCharValue: 'EU-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0052443816' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'APS3-Aurora:StorageUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0044965104' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'APS3-Aurora:BackupUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0044965104' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-central-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'EUC1-RDS:Multi-AZ-GP2-Storage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '25' },
      { VarCharValue: '7' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'Multi-AZUsage:db.r5.12xl' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '48' },
      { VarCharValue: '8783.99999999999' },
      { VarCharValue: '20' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsEC2EFSRDSWithReplicationFactors: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataEleven],
    },
  }

const queryResultsDataTwelve = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS3-StorageUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.00508608' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-central-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS3-BackupUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.00508608' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'ap-southeast-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS1-InstanceUsage:db.r5.large' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '2' },
      { VarCharValue: '2.018888' },
      { VarCharValue: '6' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonDynamoDB' },
      { VarCharValue: 'TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0000142996' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonECR' },
      { VarCharValue: 'USW1-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: testAccountId },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'ap-southeast-1' },
      { VarCharValue: 'AmazonSimpleDB' },
      { VarCharValue: 'APS2-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: testAccountId },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsDatabasesWithReplicationFactors: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataTwelve],
    },
  }

const queryResultsDataThirteen = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-BoxUsage:t3.2xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '8' },
      { VarCharValue: '88' },
      { VarCharValue: '552' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'NatGateway-Hours' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '233705' },
      { VarCharValue: '10516.725' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-02' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '500' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-02' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonCloudWatch' },
      { VarCharValue: 'CW:GMD-Metrics' },
      { VarCharValue: 'Metrics' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '600' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-03' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-USE1-AWS-Out-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '1574' },
      { VarCharValue: '786' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-03' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'NatGateway-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '601143.3831' },
      { VarCharValue: '27051.45224' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-04' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AWSDeveloperSupport' },
      { VarCharValue: 'Dollar' },
      { VarCharValue: 'Dollar' },
      { VarCharValue: '' },
      { VarCharValue: '1019479.081' },
      { VarCharValue: '30584.37244' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithReclassifiedUnknowns: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataThirteen],
    },
  }
const queryResultsDataFourteen = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'EU-SpotUsage:h1.16xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonFSx' },
      { VarCharValue: 'EUC1-Storage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '1000' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonKinesis' },
      { VarCharValue: 'EU-LongTermRetention-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AWSBackup' },
      { VarCharValue: 'EU-ColdStorage-ByteHrs-EFS' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AWSBackup' },
      { VarCharValue: 'EU-WarmStorage-ByteHrs-EFS' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonApiGateway' },
      { VarCharValue: 'EU-ApiGatewayCacheUsage:0.5GB' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AWSDirectConnect' },
      { VarCharValue: 'EUC1-EQMU1-PortUsage:10G' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AWSDirectoryService' },
      { VarCharValue: 'EUC1-Std-SharedMsftAD-Usage' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '200' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]
export const athenaMockGetQueryH1ApiFsxBackupDirectConnectDirectoryService: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataFourteen],
    },
  }

const queryResultsDataFifteen = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '2' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-28' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'ElasticMapReduce' },
      { VarCharValue: 'APN1-BoxUsage:m5.xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '4' },
      { VarCharValue: '6' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-29' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'ca-central-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-SpotUsage:m5zn.2xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '8' },
      { VarCharValue: '12' },
      { VarCharValue: '20' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-31' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-BoxUsage:t3.2xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '8' },
      { VarCharValue: '88' },
      { VarCharValue: '25' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithEC2ElasticMapWithEmbodiedEmissions: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataFifteen],
    },
  }

const queryResultsDataSixteen = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:t2.micro' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '0' }, // usage amount
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithNoUsageAmount: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataSixteen],
    },
  }

const queryResultsDataSeventeen = [
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:ml.m5.xlarge' }, // usage type
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '8' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2020-10-30' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'HostBoxUsage:mac1.metal' }, // usage type
      { VarCharValue: 'Hrs' },
      { VarCharValue: '1' },
      { VarCharValue: '8' },
      { VarCharValue: '5' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithUnknownInstanceType: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataSeventeen],
    },
  }

const queryResultsDataEighteen = [
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE1-BoxUsage:p3dn.24xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '96' },
      { VarCharValue: '24' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE2-BoxUsage:p4d.24xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '96' },
      { VarCharValue: '48' },
      { VarCharValue: '10' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithGPUInstances: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataEighteen],
    },
  }

const queryResultsX86AndARMLambdas = [
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AWSLambda' },
      { VarCharValue: 'Lambda-GB-Second' },
      { VarCharValue: 'seconds' },
      { VarCharValue: '' },
      { VarCharValue: '5' },
      { VarCharValue: '8' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2022-01-02' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AWSLambda' },
      { VarCharValue: 'Lambda-GB-Second-ARM' },
      { VarCharValue: 'Lambda-GB-Second' },
      { VarCharValue: '' },
      { VarCharValue: '7' },
      { VarCharValue: '9' },
      { VarCharValue: '' },
      { VarCharValue: '' },
    ],
  },
]

export const athenaMockGetQueryResultsWithX86AndARMLambdas: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsX86AndARMLambdas],
    },
  }

const queryResultsDataTaggedResources = [
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE1-BoxUsage:p3dn.24xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '96' },
      { VarCharValue: '24' },
      { VarCharValue: '10' },
      { VarCharValue: 'prod' },
      { VarCharValue: 'user-1' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE1-BoxUsage:p3dn.24xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '96' },
      { VarCharValue: '24' },
      { VarCharValue: '10' },
      { VarCharValue: 'prod' },
      { VarCharValue: 'user-1' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE1-BoxUsage:p3dn.24xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '96' },
      { VarCharValue: '10' },
      { VarCharValue: '4.2' },
      { VarCharValue: 'test' },
      { VarCharValue: 'user-1' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE1-BoxUsage:p3dn.24xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '96' },
      { VarCharValue: '1' },
      { VarCharValue: '0.42' },
      { VarCharValue: 'prod' },
      { VarCharValue: 'user-2' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2022-01-01' },
      { VarCharValue: testAccountId },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USE1-BoxUsage:p3dn.24xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '96' },
      { VarCharValue: '2' },
      { VarCharValue: '0.82' },
      { VarCharValue: 'staging' },
      { VarCharValue: 'user-3' },
    ],
  },
]

export const athenaMockGetQueryResultsWithTaggedResources: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataTaggedResources],
    },
  }
