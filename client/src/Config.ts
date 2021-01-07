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
    USE_BILLING_DATA?: boolean
  }
}

const useAWSBillingData = !!process.env.REACT_APP_AWS_USE_BILLING_DATA
const useGCPBillingData = !!process.env.REACT_APP_GCP_USE_BILLING_DATA

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

const gcpServicesSupportedWithoutBillingData = [
  {
    key: 'computeEngine',
    name: 'Compute Engine',
  },
]

const gcpServicesSupportedWithBillingData = [
  ...gcpServicesSupportedWithoutBillingData,
  {
    key: 'App Engine',
    name: 'App Engine',
  },
  {
    key: 'Cloud Composer',
    name: 'Cloud Composer',
  },
  {
    key: 'Cloud Dataflow',
    name: 'Cloud Dataflow',
  },
  {
    key: 'Cloud Filestore',
    name: 'Cloud Filestore',
  },
  {
    key: 'Cloud Pub/Sub',
    name: 'Cloud Pub/Sub',
  },
  {
    key: 'Cloud SQL',
    name: 'Cloud SQL',
  },
  {
    key: 'Cloud Storage',
    name: 'Cloud Storage',
  },
  {
    key: 'Data Catalog',
    name: 'Data Catalog',
  },
  {
    key: 'Source Repository',
    name: 'Source Repository',
  },
  {
    key: 'Confluent Apache Kafka on Confluent Cloud',
    name: 'Confluent Apache Kafka on Confluent Cloud',
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
    USE_BILLING_DATA: useGCPBillingData,
    CURRENT_SERVICES: useGCPBillingData ? gcpServicesSupportedWithBillingData : gcpServicesSupportedWithoutBillingData,
  },
}

export default appConfig
