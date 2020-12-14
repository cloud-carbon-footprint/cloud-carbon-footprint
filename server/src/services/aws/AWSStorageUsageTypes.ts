/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

export const SSD_USAGE_TYPES: string[] = [
  'VolumeUsage.gp2', // EBS
  'VolumeUsage.piops', // EBS
  'GP2-Storage', // RDS
  'PIOPS-Storage', // RDS
  'Kafka.Storage.GP2', // Kafka
  'ES:Magnetic-Storage', // ElasticSearch Magnetic Storage
]

export const HDD_USAGE_TYPES: string[] = [
  'VolumeUsage.st1', // EBS HDD Volume
  'VolumeUsage.sc1', // EBS HDD Volume
  'VolumeUsage', // EBS HDD Volume
  'SnapshotUsage', // EBS snapshot in S3
  'TimedStorage-ByteHrs', // S3
  'StorageUsage', // RDS HDD Storage
  'GlacierByteHrs', // Glacier
  'Aurora:BackupUsage', // Aurora back up in S3
  'RDS:ChargedBackupUsage', // RDS Backup in S3
  'TimedStorage-RRS-ByteHrs', // S3 Reduced Redundancy Storage
  'BackupUsage', // DocumentDB backup in S3
  'Redshift:PaidSnapshots', // Redshift Snapshot in S3
  'TimedStorage-SIA-ByteHrs', // S3 STANDARD_IA storage
  'EarlyDelete-SIA', // S3 STANDARD_IA storage deleted before the minimum 30-day commitment ended
  'TimedStorage-GlacierStaging', // Glacier Staging
  'TimedStorage-SIA-SmObjects', // S3 STANDARD_IA storage (small)
  'TimedPITRStorage-ByteHrs', // DynamoDB Point-In-Time-Recovery
  'TimedStorage-GDA-ByteHrs', // S3 Glacier Deep Archive storage
  'TimedStorage-ZIA-ByteHrs', // S3 ONEZONE_IA storage
  'TimedStorage-INT-FA-ByteHrs', // S3 frequent access tier of INTELLIGENT_TIERING Storage
  'EarlyDelete-GDA', // S3 Glacier Deep Archive storage deleted before the minimum 180-day commitment ended
  'ProcessedStorage-ByteHrs', // IoT Analytics Data Store in S3
  'EarlyDelete-ZIA', // S3 ONEZONE_IA storage deleted before the minimum 30-day commitment ended
  'EarlyDelete-ByteHrs', // S3 Glacier storage before the 90-day minimum commitment ended
  'TimedStorage-ZIA-SmObjects', // S3 ONEZONE_IA storage (small)
  'TimedStorage-INT-IA-ByteHrs', // S3 infrequent access tier of INTELLIGENT_TIERING storage
  'EarlyDelete-SIA-SmObjects', //  S3 STANDARD_IA storage deleted before the minimum 30-day commitment ended (small)
  'QS-Enterprise-SPICE', // Quicksight Enterprise SPICE
]
