/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

// This are the services we are over estimating to be SSD because we don't know what the underlying storage type is (SSD or HDD).
export const SSD_SERVICES: string[] = [
  'AmazonDocDB',
  'AmazonDynamoDB',
  'AmazonECR',
  'AmazonEFS',
  'AmazonES',
  'AmazonSimpleDB',
  'AmazonSageMaker',
  'AWSIoTAnalytics',
  'AmazonKinesisAnalytics',
  'AmazonMQ',
  'AmazonECS',
]

export const SSD_USAGE_TYPES: string[] = [
  'VolumeUsage.gp2', // EBS
  'VolumeUsage.io2', // EBS
  'VolumeUsage.gp3', // EBS
  'VolumeUsage.piops', // EBS
  'GP2-Storage', // RDS
  'PIOPS-Storage', // RDS
  'Kafka.Storage.GP2', // Kafka
  'ES:Magnetic-Storage', // ElasticSearch Magnetic Storage
  'TimedPITRStorage-ByteHrs', // DynamoDB Point-In-Time-Recovery
  'ECS-EC2-GB-Hours', // ECS EC2 Storage
  'Lambda-GB-Second', // Lambda GB-Seconds Storage
  'Lambda-Edge-GB-Second', // Lambda Edge GB-Seconds Storage
  'RDS:Multi-AZ-StorageUsage', // RDS Multi Availability Zone Storage
  'Fargate-GB-Hours', //Fargate Storage
]

export const HDD_USAGE_TYPES: string[] = [
  'VolumeUsage.st1', // EBS HDD Volume
  'VolumeUsage.sc1', // EBS HDD Volume
  'VolumeUsage', // EBS HDD Volume
  'EBS:SnapshotUsage', // EBS snapshot in S3
  'TimedStorage-ByteHrs', // Many different services
  'RDS:StorageUsage', // RDS HDD Storage
  'Aurora:StorageUsage', // RDS Aurora Storage
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
  'TimedStorage-ZIA-ByteHrs', // S3 ONEZONE_IA storage
  'TimedStorage-INT-FA-ByteHrs', // S3 frequent access tier of INTELLIGENT_TIERING Storage
  'EarlyDelete-GDA', // S3 Glacier Deep Archive storage deleted before the minimum 180-day commitment ended
  'ProcessedStorage-ByteHrs', // IoT Analytics Data Store in S3
  'EarlyDelete-ZIA', // S3 ONEZONE_IA storage deleted before the minimum 30-day commitment ended
  'EarlyDelete-ByteHrs', // S3 Glacier storage before the 90-day minimum commitment ended
  'TimedStorage-ZIA-SmObjects', // S3 ONEZONE_`IA storage (small)
  'TimedStorage-INT-IA-ByteHrs', // S3 infrequent access tier of INTELLIGENT_TIERING storage
  'EarlyDelete-SIA-SmObjects', //  S3 STANDARD_IA storage deleted before the minimum 30-day commitment ended (small)
  'QS-Enterprise-SPICE', // Quicksight Enterprise SPICE
  'TimedBackupStorage-ByteHrs', // DynamoDB Backup storage is S3
  'DurableApplicationBackups', // Kinesis Backup Store in S3
]

export const NETWORKING_USAGE_TYPES: string[] = [
  'NatGateway-Hours',
  'LoadBalancerUsage',
  'IdleAddress',
  'UnusedStaticIP',
  'AdditionalAddress',
  'ResolverNetworkInterface',
  'VpcEndpoint-Hours',
  'VPN-Usage-Hours',
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
]

export enum PRICING_UNITS {
  HOURS_1 = 'Hrs',
  HOURS_2 = 'Hours',
  HOURS_3 = 'hours',
  VCPU_HOURS = 'vCPU-Hours',
  DPU_HOUR = 'DPU-Hour',
  LAMBDA_GB_SECONDS = 'Lambda-GB-Second',
  GB_HOURS = 'GB-Hours',
  GB_MONTH_1 = 'GB-Mo',
  GB_MONTH_2 = 'GB-Month',
  GB_MONTH_3 = 'GB-Mp',
  GB_MONTH_4 = 'GB-month',
  SECONDS_1 = 'seconds',
  SECONDS_2 = 'Second',
}
