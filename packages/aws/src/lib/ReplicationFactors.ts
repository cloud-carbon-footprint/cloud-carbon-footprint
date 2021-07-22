/*
 * © 2021 Thoughtworks, Inc.
 */

import { ReplicationFactorsForService } from '@cloud-carbon-footprint/core'
import { containsAny } from '@cloud-carbon-footprint/common'
import { AWS_CLOUD_CONSTANTS } from '../domain'

const { REPLICATION_FACTORS } = AWS_CLOUD_CONSTANTS

enum SERVICES {
  S3 = 'AmazonS3',
  EC2 = 'AmazonEC2',
  EFS = 'AmazonEFS',
  RDS = 'AmazonRDS',
  DOC_DB = 'AmazonDocDB',
  DYNAMO_DB = 'AmazonDynamoDB',
  ECR = 'AmazonECR',
  ELASTICACHE = 'AmazonElastiCache',
  SIMPLE_DB = 'AmazonSimpleDB',
}

export const AWS_REPLICATION_FACTORS_FOR_SERVICES: ReplicationFactorsForService =
  {
    [SERVICES.S3]: (usageType: string): number => {
      if (
        containsAny(
          ['TimedStorage-ZIA', 'EarlyDelete-ZIA', 'TimedStorage-RRS'],
          usageType,
        )
      )
        return REPLICATION_FACTORS.S3_ONE_ZONE_REDUCED_REDUNDANCY // 2
      if (containsAny(['TimedStorage', 'EarlyDelete'], usageType))
        return REPLICATION_FACTORS.S3 // 3
    },
    [SERVICES.EC2]: (usageType: string): number => {
      if (usageType.includes('VolumeUsage'))
        return REPLICATION_FACTORS.EC2_EBS_VOLUME // 2
      if (usageType.includes('SnapshotUsage'))
        return REPLICATION_FACTORS.EC2_EBS_SNAPSHOT // 3
    },
    [SERVICES.EFS]: (usageType: string): number => {
      if (usageType.includes('ZIA')) return REPLICATION_FACTORS.EFS_ONE_ZONE // 2
      return REPLICATION_FACTORS.EFS // 3
    },
    [SERVICES.RDS]: (usageType: string): number => {
      if (usageType.includes('BackupUsage'))
        return REPLICATION_FACTORS.RDS_BACKUP // 3
      if (usageType.includes('Aurora')) return REPLICATION_FACTORS.RDS_AURORA // 6
      if (usageType.includes('Multi-AZ'))
        return REPLICATION_FACTORS.RDS_MULTI_AZ // 2
    },
    [SERVICES.DOC_DB]: (usageType: string): number => {
      if (usageType.includes('BackupUsage'))
        return REPLICATION_FACTORS.DOCUMENT_DB_BACKUP // 3
      return REPLICATION_FACTORS.DOCUMENT_DB_STORAGE // 2
    },
    [SERVICES.DYNAMO_DB]: (): number => {
      return REPLICATION_FACTORS.DYNAMO_DB // 2
    },
    [SERVICES.ECR]: (usageType: string): number => {
      if (usageType.includes('TimedStorage'))
        return REPLICATION_FACTORS.ECR_STORAGE // 3
    },
    [SERVICES.ELASTICACHE]: (usageType: string): number => {
      if (usageType.includes('BackupUsage'))
        return REPLICATION_FACTORS.DOCUMENT_ELASTICACHE_BACKUP // 3
    },
    [SERVICES.SIMPLE_DB]: (usageType: string): number => {
      if (usageType.includes('TimedStorage'))
        return REPLICATION_FACTORS.SIMPLE_DB // 2
    },
  }
