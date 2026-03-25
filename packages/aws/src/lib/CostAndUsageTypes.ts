/*
 * © 2021 Thoughtworks, Inc.
 */

import { QUERY_DATE_TYPES } from '@cloud-carbon-footprint/common'

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
  'AmazonFSx',
  'AmazonKinesis',
]

export const SSD_USAGE_TYPES: string[] = [
  'VolumeUsage.gp2', // EBS
  'VolumeUsage.io2', // EBS
  'VolumeUsage.io1', // EBS
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
  'ra3.large', //Redshift SSD
  'Storage.SSD.50', // Fsx
  'Storage.MultiAZ:SSD', // Fsx
  'RDS:GP3-Storage', // RDS
  'Express.Storage', // Express
  'TimedStorage-RabbitMQ-ByteHrs', // Amazon MQ for RabbitMQ (EBS, high-throughput messaging)
  'Vectors-TimedStorage-ByteHrs', // S3 Vectors (AI Knowledge Bases, high-speed random access)
  'Fargate-EphemeralStorage-GB-Hours', // Fargate ephemeral SSD storage
  'Lambda-Storage-GB-Second', // Lambda /tmp ephemeral SSD storage
  'Lambda-Storage-GB-Second-ARM', // Lambda /tmp ephemeral SSD storage (ARM)
  'ES:GP3-Storage', // OpenSearch GP3 SSD storage
  'RDS:Multi-AZ-GP3-Storage', // RDS Multi-AZ GP3 SSD storage
  'RDS:PIOPS-Storage-IO2', // RDS Provisioned IOPS IO2 SSD
  'RDS:Multi-AZ-PIOPS-Storage-IO2', // RDS Multi-AZ Provisioned IOPS IO2 SSD
  'RDS:Multi-AZCluster-PIOPS-Storage-IO2', // RDS Cluster Provisioned IOPS IO2 SSD
  'IO-OptimizedStorageUsage', // Aurora I/O-Optimized SSD storage
  'RDS:Multi-AZCluster-GP3-Storage', // RDS Cluster GP3 SSD
  'Storage.SSD.125', // FSx SSD 125GB
  'Storage.SAZ_2N2:SSD', // FSx Single-AZ SSD
  'Storage.SAZ_2N:SSD', // FSx Single-AZ SSD
  'Storage.SAZ2:SSD', // FSx Single-AZ SSD
  'Fargate-ARM-GB-Hours', // Fargate ARM container memory-hours
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
  'ColdStorage-ByteHrs-EFS', // AWSBackup
  'WarmStorage-ByteHrs-EFS', //AWSBackup
  'WarmStorage-ByteHrs-DynamoDB', //AWSBackup
  'MagneticStore-ByteHrs', // EBS Backup
  'ColdStorage-ByteHrs-DynamoDB', //AWSBackup
  'WarmStorage-ByteHrs-S3', // S3
  'AMP:MetricStorageByteHrs',
  'TimedStorage-INT-AIA-ByteHrs', // S3 Glacier
  'TimedStorage-GIR-ByteHrs', // S3 Glacier
  'ArchiveTimedStorage-ByteHrs', // EFS Archive tier (Magnetic)
  'ArchiveTimedStorage-SmallFiles', // EFS Archive small file overhead (Magnetic)
  'IATimedStorage-ByteHrs', // EFS Infrequent Access (Magnetic)
  'IATimedStorage-ET-ByteHrs', // EFS IA Elastic Throughput (Magnetic)
  'IATimedStorage-ET-SmallFiles', // EFS IA small file overhead (Magnetic)
  'IATimedStorage-SmallFiles', // EFS IA small file overhead (Magnetic)
  'TimedStorage-INT-AA-ByteHrs', // S3 Intelligent-Tiering Archive Access
  'Tables-TimedStorage-ByteHrs', // S3 Tables (Apache Iceberg)
  'TimedStorage-EBS-ByteHrs', // Generic EBS storage (snapshots/cold tiers)
  'TimedStorage-GigabyteHrs', // Generic S3/EFS Standard storage
  'TimedStorage-GIR-SmObjects', // S3 Glacier Instant Retrieval (Small Objects)
  'TimedStorage-GlacierByteHrs', // S3 Glacier archival storage
  'TimedStorage-Z-ByteHrs', // One Zone storage (EFS/S3, Magnetic)
  'TimedStorage-XZ-ByteHrs', // Cross-Zone archival storage
  'ElasticStorageUsage', // S3 Intelligent-Tiering (HDD profile)
  'EarlyDelete-GIR', // S3 Glacier Instant Retrieval
  'EarlyDelete-GIR-SmObjects', // S3 Glacier Instant Retrieval (small objects)
  'StorageUsedInS3ByteHour', // Standard S3 object storage (HDD profile)
  'SnapshotArchiveEarlyDelete', // EBS snapshot archive early deletion
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
  'DataTransfer-xAZ-Out-Bytes', // Cross-AZ outbound data movement
  'DataTransfer-xAZ-In-Bytes', // Cross-AZ inbound data movement
  'DataTransfer-AZ-Out-Bytes', // Intra-AZ outbound network traffic
  'DataTransfer-AZ-In-Bytes', // Intra-AZ inbound network traffic
  'VpcPeering-Out-Bytes', // Inter-VPC peering outbound traffic
  'VpcPeering-In-Bytes', // Inter-VPC peering inbound traffic
  'DataTransferOut', // Generic outbound internet data transfer
  'DataTransfer-Out-OBytes', // CloudFront origin fetch data movement
  'DataXfer-Out-Free-Bytes', // Outbound traffic (Free tier)
  'DataProcessing-Bytes', // Load balancer data plane processing
  'Traffic-GB-Processed', // ELB/Gateway data plane traffic
  'S3RTC-In-Bytes', // S3 Replication Time Control inbound
  'S3RTC-Out-Bytes', // S3 Replication Time Control outbound
  'VPCLattice-DataProcessing-Bytes', // VPC Lattice managed data plane traffic
  'AWS-In-Bytes', // Regional inbound data transfer
  'MRAP-Out-Bytes', // Multi-Region Access Point outbound
  'ImportDataSize-Bytes', // Data import transfer volume
]

export const BYTE_HOURS_USAGE_TYPES: string[] = [
  'ByteHrs',
  'SmObjects',
  'EarlyDelete-GDA',
  'EarlyDelete-SIA',
  'EarlyDelete-ZIA',
  'GlacierByteHrs',
  'ByteHrs-EFS',
  'ByteHrs-DynamoDB',
  'EarlyDelete-GIR',
]

export const UNKNOWN_USAGE_TYPES: string[] = [
  'AmazonEKS-Hours:perCluster',
  'SoftwareUsage',
  'BundleUsage',
  'Small-Directory-Usage',
  'MicrosoftAD-DC-Usage', // AWS Directory Service Microsoft AD (all sizes: Std, Lrg, etc.)
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
  'AppRunner-GB-hours', // App Runner memory provisioning (DRAM, not storage)
  'ApiGatewayCacheUsage',
  'PortUsage',
  'SharedMsftAD-Usage',
  'Kafka.mcu.general',
  'SnapshotArchiveStorage',
  'PaidPrivateCA',
  'Firehose-VpcDelivery-Hours',
  'Airflow-MediumEnvironment',
  'IPAddressManager-IP-Hours',
  'Gateway:VTL-Storage',
  'PublicIPv4:InUseAddress', // Public IPv4 address in use
  'VPCLattice-Service-Hourly', // VPC Lattice service fee
  'CloudWAN-Attachment-Hours', // Availability fee for logical network attachment
  'Guardrail-', // Bedrock Guardrail safety scanning (abstracted security unit)
  'Column-Statistics-DPU-Hour', // Glue DPU for column statistics (serverless abstraction)
  'CodeExecutionInDPUHours', // Athena Spark notebook DPU execution
  'Canvas:Session-Hrs', // SageMaker Canvas application session time
  'Logs-LiveTail', // CloudWatch Logs live session duration
  'Application-Signals', // CloudWatch application health monitoring
  'MLflow:TrackingServerCompute', // SageMaker MLflow tracking server (Small/Medium/Large)
  'Airflow-MicroEnvironment', // MWAA micro Airflow environment
  'MemoryOptimizedStoppedGraphUsage', // Neptune stopped graph memory reservation (NCU units)
  'Small-SimpleAD-Usage', // AWS Directory Service Simple AD
  'AmazonEKS-Hours:extendedSupport', // EKS extended K8s version support (managed control plane)
  'Q-Business-Starter-Index-free', // Amazon Q Business free-tier knowledge index
  'KafkaServerless-ClusterHours', // MSK Serverless cluster base hourly fee
  'VpcEndpoint-Resource-Hours', // VPC endpoint resource provisioning fee
  'VpcLattice-Service-Network-Resource-Hours', // VPC Lattice service network resource fee
  'CachedData:Valkey', // That is RAM memory; it will not be categorized under SSD.
  'CachedData:Redis', // That is RAM memory; it will not be categorized under SSD.
  'CachedData:Memcached', // That is RAM memory; it will not be categorized under SSD.
]

export const UNSUPPORTED_USAGE_TYPES: string[] = [
  'EMR-EKS-EC2-GBHours', // "Double counted" with EC2 usage rows, so ignore.
  'APS3-EMR-EKS-EC2-vCPUHours', // "Double counted" with EC2 usage rows, so ignore.
  'ECS-EC2-GB-Hours', // "Double counted" with EC2 usage rows, so ignore.
  'ECS-EC2-vCPU-Hours', // "Double counted" with EC2 usage rows, so ignore.
  'Dollar', // AWSDeveloperSupport - no energy associated with support cost
  'HostBoxUsage', // "Double counted" with resource usage rows, so ignore.
  'Runtime:Consumption-based:Memory', // Serverless memory allocation, avoid double-counting with compute.
  'SERVERLESS-MemoryGBHours', // RAM-time, avoid double-counting server carbon.
  'EKS-Auto:', // EKS Auto Mode management fees, hardware tracked in EC2/Fargate line items ( EKS-Auto:<instance>-management-hours ).
  'ECS-Anywhere-Instance-hours', // On-premises management fee, no AWS compute hardware.
  'EnterpriseServer', // It represents license cost. "Double counted" with EC2 usage rows, so ignore.
  'MemoryOptimizedGraphUsage', // Neptune NCU abstraction, no direct hardware mapping.
  'ConnectorSync', // Kendra data connector sync, no direct hardware mapping.
  'KendraDeveloperEdition', // Kendra developer edition index, abstracted managed service.
  'Kendra-GenAI-', // Kendra GenAI capacity, abstracted managed service.
  'OpenSearchExtendedSupport', // Double-count the emissions already captured by ES.instance
]

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
  LAMBDA_SECONDS = 'Lambda-GB-Second',
}

export const AWS_QUERY_GROUP_BY: QUERY_DATE_TYPES = {
  day: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
}
