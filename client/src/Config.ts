/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import dotenv from 'dotenv'
dotenv.config()

export interface ClientConfig {
  CURRENT_PROVIDERS: {
    key: string
    name: string
  }[]
  AWS: {
    CURRENT_SERVICES: {
      key: string
      name: string
    }[]
    USE_BILLING_DATA?: boolean
  }
  GCP: {
    CURRENT_SERVICES: {
      key: string
      name: string
    }[]
  }
}

const useAWSBillingData = !!process.env.REACT_APP_AWS_USE_BILLING_DATA

const awsServicesSupportedWithoutBillingData = [
  {
    key: 'ebs',
    name: 'EBS',
  },
  {
    key: 's3',
    name: 'S3',
  },
  {
    key: 'ec2',
    name: 'EC2',
  },
  {
    key: 'elasticache',
    name: 'ElastiCache',
  },
  {
    key: 'rds',
    name: 'RDS',
  },
  {
    key: 'lambda',
    name: 'Lambda',
  },
]

const awsServicesSupportedWithBillingData = [
  ...awsServicesSupportedWithoutBillingData,
  {
    key: 'cloudwatch',
    name: 'CloudWatch',
  },
  {
    key: 'msk',
    name: 'Kafka',
  },
  {
    key: 'elasticmapreduce',
    name: 'Elastic Map Reduce',
  },
  {
    key: 'glacier',
    name: 'Glacier',
  },
  {
    key: 'sagemaker',
    name: 'Sage Maker',
  },
  {
    key: 'lightsail',
    name: 'Lightsail',
  },
  {
    key: 'directoryservice',
    name: 'Directory Service',
  },
  {
    key: 'iotanalytics',
    name: 'IoT Analytics',
  },
  {
    key: 'databasemigrationsvc',
    name: 'Database Migration Service',
  },
  {
    key: 'es',
    name: 'Elasticsearch',
  },
  {
    key: 'quicksight',
    name: 'QuickSight',
  },
  {
    key: 'efs',
    name: 'Elastic File System',
  },
  {
    key: 'redshift',
    name: 'Redshift',
  },
  {
    key: 'dynamodb',
    name: 'AmazonDynamoDB',
  },
  {
    key: 'datapipeline',
    name: 'Data Pipeline',
  },
  {
    key: 'elb',
    name: 'Elastic Load Balancing',
  },
  {
    key: 'docdb',
    name: 'DocumentDB',
  },
  {
    key: 'simpledb',
    name: 'SimpleDB',
  },
  {
    key: 'ecr',
    name: 'Elastic Container Registry',
  },
  {
    key: 'vpc',
    name: 'Virtual Private Cloud',
  },
  {
    key: 'mq',
    name: 'Message Queue',
  },
  {
    key: 'glue',
    name: 'Glue',
  },
  {
    key: 'ecs',
    name: 'ECS',
  },
  {
    key: 'kinesis',
    name: 'Kinesis',
  },
  {
    key: 'cloudfront',
    name: 'CloudFront',
  },
]

const appConfig: ClientConfig = {
  CURRENT_PROVIDERS: [
    { key: 'aws', name: 'AWS' },
    { key: 'gcp', name: 'GCP' },
  ],
  AWS: {
    USE_BILLING_DATA: useAWSBillingData,
    CURRENT_SERVICES: useAWSBillingData ? awsServicesSupportedWithBillingData : awsServicesSupportedWithoutBillingData,
  },
  GCP: {
    CURRENT_SERVICES: [
      {
        key: 'computeEngine',
        name: 'Compute Engine',
      },
    ],
  },
}

export default appConfig
