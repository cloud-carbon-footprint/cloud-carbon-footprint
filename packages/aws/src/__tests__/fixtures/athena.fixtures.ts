/*
 * © 2021 Thoughtworks, Inc.
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

export const athenaMockGetQueryResultsWithKenesisESAndEc2Spot: Athena.GetQueryResultsOutput =
  {
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
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonMSK' },
      { VarCharValue: 'APS3-Kafka.t3.small' },
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

const queryResultsDataTen = [
  {
    Data: [
      { VarCharValue: '2021-01-02' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'USE1-BytesDeleted-STANDARD' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0253623422' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-03' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'USE1-BytesDeleted-SIA' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.023462346' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-04' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'eu-north-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'EUN1-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '123456789' },
      { VarCharValue: '7' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-05' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-GDA-Staging' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.06434566' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-06' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-ZIA-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '465759470' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-07' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-RRS-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '876543637' },
      { VarCharValue: '7' },
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
      { VarCharValue: '123456789' },
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APS3-EBS:VolumeUsage.gp2' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '23.9310345' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APS3-EBS:SnapshotUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '23.9310345' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonEFS' },
      { VarCharValue: 'EU-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0052443816' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'APS3-Aurora:StorageUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0044965104' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'APS3-Aurora:BackupUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0044965104' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'eu-central-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'EUC1-RDS:Multi-AZ-GP2-Storage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '25' },
      { VarCharValue: '7' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonRDS' },
      { VarCharValue: 'Multi-AZUsage:db.r5.12xl' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '48' },
      { VarCharValue: '8783.99999999999' },
      { VarCharValue: '20' },
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
      { VarCharValue: '123456789' },
      { VarCharValue: 'ap-south-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS3-StorageUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.00508608' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'eu-central-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS3-BackupUsage' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.00508608' },
      { VarCharValue: '10' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'ap-southeast-1' },
      { VarCharValue: 'AmazonDocDB' },
      { VarCharValue: 'APS1-InstanceUsage:db.r5.large' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '2' },
      { VarCharValue: '2.018888' },
      { VarCharValue: '6' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonDynamoDB' },
      { VarCharValue: 'TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '0.0000142996' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonECR' },
      { VarCharValue: 'USW1-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '123456789' },
      { VarCharValue: '5' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'ap-southeast-1' },
      { VarCharValue: 'AmazonSimpleDB' },
      { VarCharValue: 'APS2-TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '123456789' },
      { VarCharValue: '5' },
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
      { VarCharValue: '123456789' },
      { VarCharValue: 'eu-west-3' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'EUW3-SpotUsage:i3.8xlarge' },
      { VarCharValue: 'Hours' },
      { VarCharValue: '' },
      { VarCharValue: '370.0' },
      { VarCharValue: '866.096' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'SpotUsage:d2.8xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '3962.0' },
      { VarCharValue: '75' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'eu-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'EU-EBSOptimized:g4dn.xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '4.734722' },
      { VarCharValue: '0.0' },
    ],
  },
]

export const athenaMockGetQueryResultsAdditionalInstanceTypes: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataThirteen],
    },
  }

const queryResultsDataFourteen = [
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-west-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'APE1-BoxUsage:t3.2xlarge' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '8' },
      { VarCharValue: '88' },
      { VarCharValue: '552' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-01' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'NatGateway-Hours' },
      { VarCharValue: 'Hrs' },
      { VarCharValue: '' },
      { VarCharValue: '233705' },
      { VarCharValue: '10516.725' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-02' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonS3' },
      { VarCharValue: 'TimedStorage-ByteHrs' },
      { VarCharValue: 'GB-Mo' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '500' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-02' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonCloudWatch' },
      { VarCharValue: 'CW:GMD-Metrics' },
      { VarCharValue: 'Metrics' },
      { VarCharValue: '' },
      { VarCharValue: '2' },
      { VarCharValue: '600' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-03' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-1' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'USW2-USE1-AWS-Out-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '1574' },
      { VarCharValue: '786' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-03' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AmazonEC2' },
      { VarCharValue: 'NatGateway-Bytes' },
      { VarCharValue: 'GB' },
      { VarCharValue: '' },
      { VarCharValue: '601143.3831' },
      { VarCharValue: '27051.45224' },
    ],
  },
  {
    Data: [
      { VarCharValue: '2021-01-04' },
      { VarCharValue: '123456789' },
      { VarCharValue: 'us-east-2' },
      { VarCharValue: 'AWSDeveloperSupport' },
      { VarCharValue: 'Dollar' },
      { VarCharValue: 'Dollar' },
      { VarCharValue: '' },
      { VarCharValue: '1019479.081' },
      { VarCharValue: '30584.37244' },
    ],
  },
]

export const athenaMockGetQueryResultsWithReclassifiedUnknowns: Athena.GetQueryResultsOutput =
  {
    ResultSet: {
      Rows: [queryResultsHeaders, ...queryResultsDataFourteen],
    },
  }
