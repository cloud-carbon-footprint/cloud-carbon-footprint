/*
 * © 2021 Thoughtworks, Inc.
 */

import { QUERY_DATE_TYPES } from '@cloud-carbon-footprint/common'
import { EstimateClassification } from '@cloud-carbon-footprint/core'

// This are the services we are over estimating to be SSD because we don't know what the underlying storage type is (SSD or HDD).
export const SSD_SERVICES: string[] = [
  'AmazonDocDB',
  'AmazonDynamoDB',
  'AmazonEFS',
  'AmazonES',
  'AmazonSimpleDB',
  'AmazonSageMaker',
  'AWSIoTAnalytics',
  'AmazonKinesisAnalytics',
  'AmazonMQ',
  'AmazonECS',
  'AmazonLightsail',
  'AmazonNeptune',
]

export const SSD_USAGE_TYPES: string[] = [
  'VolumeUsage.gp2', // EBS
  'VolumeUsage.io2', // EBS
  'VolumeUsage.gp3', // EBS
  'VolumeUsage.piops', // EBS
  'GP2-Storage', // RDS
  'PIOPS-Storage', // RDS
  'Aurora:StorageUsage', // RDS Aurora Storage
  'Kafka.Storage.GP2', // Kafka
  'ES:Magnetic-Storage', // ElasticSearch Magnetic Storage
  'TimedPITRStorage-ByteHrs', // DynamoDB Point-In-Time-Recovery
  'ECS-EC2-GB-Hours', // ECS EC2 Storage
  'Lambda-GB-Second', // Lambda GB-Seconds Storage
  'Lambda-Edge-GB-Second', // Lambda Edge GB-Seconds Storage
  'RDS:Multi-AZ-StorageUsage', // RDS Multi Availability Zone Storage
  'Fargate-GB-Hours', //Fargate Storage
  'dc2.large', // Redshift SSD
  'dc2.8xlarge', // Redshift SSD
  'ra3.xlplus', // Redshift SSD
  'ra3.4xlarge', // Redshift SSD
  'ra3.16xlarge', // Redshift SSD
  'Storage.SSD.50', // Fsx
  'Storage.MultiAZ:SSD', // Fsx
]

export const HDD_USAGE_TYPES: string[] = [
  'VolumeUsage.st1', // EBS HDD Volume
  'VolumeUsage.sc1', // EBS HDD Volume
  'VolumeUsage', // EBS HDD Volume
  'SnapshotUsage', // Snapshots in S3
  'TimedStorage-ByteHrs', // Many different services
  'RDS:StorageUsage', // RDS HDD Storage
  'GlacierByteHrs', // Glacier
  'Aurora:BackupUsage', // Aurora back up in S3
  'RDS:ChargedBackupUsage', // RDS Backup in S3
  'TimedStorage-RRS-ByteHrs', // S3 Reduced Redundancy Storage
  'ElastiCache:BackupUsage', // ElastiCache backup in S3
  'BackupUsage', // DocumentDB backup in S3
  'Redshift:PaidSnapshots', // Redshift Snapshot in S3
  'TimedStorage-SIA-ByteHrs', // S3 STANDARD_IA storage
  'EarlyDelete-SIA', // S3 STANDARD_IA storage deleted before the minimum 30-day commitment ended
  'TimedStorage-GlacierStaging', // Glacier Staging
  'TimedStorage-SIA-SmObjects', // S3 STANDARD_IA storage (small)
  'TimedStorage-GDA-ByteHrs', // S3 Glacier Deep Archive storage
  'TimedStorage-GDA-Staging', // S3 Glacier Deep Archive storage
  'TimedStorage-ZIA-ByteHrs', // S3 ONEZONE_IA storage
  'TimedStorage-INT-FA-ByteHrs', // S3 frequent access tier of INTELLIGENT_TIERING Storage
  'EarlyDelete-GDA', // S3 Glacier Deep Archive storage deleted before the minimum 180-day commitment ended
  'ProcessedStorage-ByteHrs', // IoT Analytics Data Store in S3
  'EarlyDelete-ZIA', // S3 ONEZONE_IA storage deleted before the minimum 30-day commitment ended
  'EarlyDelete-ByteHrs', // S3 Glacier storage before the 90-day minimum commitment ended
  'TimedStorage-ZIA-SmObjects', // S3 ONEZONE_`IA storage (small)
  'TimedStorage-INT-IA-ByteHrs', // S3 infrequent access tier of INTELLIGENT_TIERING storage
  'EarlyDelete-SIA-SmObjects', //  S3 STANDARD_IA storage deleted before the minimum 30-day commitment ended (small)
  'EarlyDelete-ZIA-SmObjects', //  S3 ONEZONE_IA storage deleted before the minimum 30-day commitment ended (small)
  'QS-Enterprise-SPICE', // Quicksight Enterprise SPICE
  'TimedBackupStorage-ByteHrs', // DynamoDB Backup storage is S3
  'DurableApplicationBackups', // Kinesis Backup Store in S3
  'dc1.large', // Redshift HDD
  'dc1.8xlarge', // Redshift HDD
  'ds2.xlarge', // Redshift HDD
  'ds2.8xlarge', // Redshift HDD
  'EU-TimedStorage-GDA-Staging', // S3 Glacier
  'BytesDeleted-STANDARD', // S3 STANDARD
  'BytesDeleted-SIA', // S3 STANDARD_IA storage
  'BytesDeleted-INT', // S3 Intelligent Tiering storage
  'BytesDeleted-GDA', // S3 GLACIER DEEP ARCHIVE storage
  'OverwriteBytes-Put-GLACIER', // S3 GLACIER storage
  'OverwriteBytes-Put-RRS', // S3 Reduced Redundancy storage
  'BackupUsage.MultiAZ', // Fsx
]

export const NETWORKING_USAGE_TYPES: string[] = [
  'AWS-Out-Bytes',
  'DataTransfer-Out-Bytes',
  'DataTransfer-Regional-Bytes',
  'TotalDataXfer-Out-Bytes',
  'Egress-Bytes',
  'UploadBytes',
  'UPLOAD',
  'ExportDataSize-Bytes',
  'DOWNLOAD',
  'Data-Bytes-Out',
  'VpcEndpoint-Bytes',
  'TransitGateway-Bytes',
  'Retrieval',
  'BilledBytes',
]

export const BYTE_HOURS_USAGE_TYPES: string[] = [
  'ByteHrs',
  'SmObjects',
  'EarlyDelete-GDA',
  'EarlyDelete-SIA',
  'EarlyDelete-ZIA',
  'GlacierByteHrs',
]

export const UNKNOWN_USAGE_TYPES: string[] = [
  'AmazonEKS-Hours:perCluster',
  'SoftwareUsage',
  'BundleUsage',
  'Small-Directory-Usage',
  'Std-MicrosoftAD-DC-Usage',
  'InactivePipelines',
  'Lambda-Provisioned',
  'ets-hd-success',
  'ets-sd-success',
  'BuildDuration',
  'Build-Min',
  'AW-HW-User-Usage',
  'TransitGateway-Hours',
  'VpcEndpoint-Hours',
  'VPN-Usage-Hours',
  'NatGateway-Hours',
  'NatGateway-Bytes',
  'LoadBalancerUsage',
  'IdleAddress',
  'UnusedStaticIP',
  'AdditionalAddress',
  'ResolverNetworkInterface',
  'DataScanned',
  'FastSnapshotRestore',
  'GMD-Metrics',
  'Dollar',
  'Airflow-SmallEnvironment',
  'MemoryStore-ByteHrs',
  'Output-SD-Hours',
  'Output-HD-Hours',
  'Output-FullHD-Hours',
  'Input-Standard-Hours',
  'Airflow-SmallWorker',
  'AppRunner-Provisioned-GB-hours',
]

export const UNSUPPORTED_USAGE_TYPES: string[] = [
  'ECS-EC2-GB-Hours', // "Double counted" with EC2 usage rows, so ignore.
  'ECS-EC2-vCPU-Hours', // "Double counted" with EC2 usage rows, so ignore.
  'Dollar', // AWSDeveloperSupport - no energy associated with support cost
]

export const UNKNOWN_USAGE_TO_ASSUMED_USAGE_MAPPING: {
  [key: string]: string[]
} = {
  Hrs: [EstimateClassification.COMPUTE],
  Metrics: [EstimateClassification.STORAGE],
  'GB-Hours': [EstimateClassification.STORAGE],
  GB: [EstimateClassification.NETWORKING],
  IOs: [EstimateClassification.COMPUTE],
  ShardHour: [EstimateClassification.COMPUTE],
  'LCU-Hrs': [EstimateClassification.COMPUTE],
  Hours: [EstimateClassification.COMPUTE],
  Hour: [EstimateClassification.COMPUTE],
  hour: [EstimateClassification.COMPUTE],
  'DPU-Hour': [EstimateClassification.COMPUTE],
  'WriteCapacityUnit-Hrs': [EstimateClassification.COMPUTE],
  'ReadCapacityUnit-Hrs': [EstimateClassification.COMPUTE],
  'Lambda-GB-Second': [EstimateClassification.COMPUTE],
  'vCPU-Hours': [EstimateClassification.COMPUTE],
  Terabytes: [EstimateClassification.NETWORKING],
  Requests: [EstimateClassification.NETWORKING],
  Request: [EstimateClassification.NETWORKING],
  'API Requests': [EstimateClassification.NETWORKING],
  'API Calls': [EstimateClassification.NETWORKING],
  Events: [EstimateClassification.STORAGE],
  ConfigurationItemRecorded: [EstimateClassification.STORAGE],
  Keys: [EstimateClassification.STORAGE],
  Objects: [EstimateClassification.STORAGE],
  Count: [EstimateClassification.STORAGE],
  'Obj-Month': [EstimateClassification.STORAGE],
  Secrets: [EstimateClassification.STORAGE],
  Queries: [EstimateClassification.UNKNOWN],
  Mo: [EstimateClassification.UNKNOWN],
  PutRequest: [EstimateClassification.UNKNOWN],
  HostedZone: [EstimateClassification.UNKNOWN],
  User: [EstimateClassification.UNKNOWN],
  'UsageRecord-month': [EstimateClassification.STORAGE],
  Activities: [EstimateClassification.UNKNOWN],
  StateTransitions: [EstimateClassification.UNKNOWN],
  ConfigRuleEvaluations: [EstimateClassification.UNKNOWN],
  '64K-Chunks': [EstimateClassification.UNKNOWN],
  Notifications: [EstimateClassification.NETWORKING],
  Alarms: [EstimateClassification.COMPUTE],
  URL: [EstimateClassification.UNKNOWN],
  'GB-Mo': [EstimateClassification.STORAGE],
  GigaBytes: [EstimateClassification.NETWORKING],
  'GB-Month': [EstimateClassification.STORAGE],
  'GB-Mp': [EstimateClassification.STORAGE],
  'GB-month': [EstimateClassification.STORAGE],
  seconds: [EstimateClassification.COMPUTE],
  Second: [EstimateClassification.COMPUTE],
  'ACU-Hr': [EstimateClassification.COMPUTE],
}

export const LINE_ITEM_TYPES: string[] = [
  'Usage',
  'DiscountedUsage',
  'SavingsPlanCoveredUsage',
]

export enum KNOWN_USAGE_UNITS {
  HOURS_1 = 'Hrs',
  HOURS_2 = 'Hours',
  HOURS_3 = 'hours',
  VCPU_HOURS = 'vCPU-Hours',
  DPU_HOUR = 'DPU-Hour',
  ACU_HOUR = 'ACU-Hr',
  GB_HOURS = 'GB-Hours',
  GB_MONTH_1 = 'GB-Mo',
  GB_MONTH_2 = 'GB-Month',
  GB_MONTH_3 = 'GB-Mp',
  GB_MONTH_4 = 'GB-month',
  GB_1 = 'GB',
  GB_2 = 'GigaBytes',
  SECONDS_1 = 'seconds',
  SECONDS_2 = 'Second',
}

export const AWS_QUERY_GROUP_BY: QUERY_DATE_TYPES = {
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
}
