/*
 * © 2021 Thoughtworks, Inc.
 */

import { ReplicationFactorsForService } from '@cloud-carbon-footprint/core'
import { containsAny } from '@cloud-carbon-footprint/common'
import { AZURE_CLOUD_CONSTANTS } from '../domain'

const { REPLICATION_FACTORS } = AZURE_CLOUD_CONSTANTS

enum SERVICES {
  STORAGE = 'Storage',
  DB_MYSQL = 'Azure Database for MySQL',
  COSMOS_DB = 'Azure Cosmos DB',
  SQL_DB = 'SQL Database',
  REDIS_CACHE = 'Redis Cache',
}

export const AZURE_REPLICATION_FACTORS_FOR_SERVICES: ReplicationFactorsForService =
  {
    [SERVICES.STORAGE]: (usageType: string): number => {
      if (usageType.includes('LRS'))
        return REPLICATION_FACTORS?.STORAGE_LRS || 0
      if (usageType.includes('GZRS'))
        return REPLICATION_FACTORS?.STORAGE_GZRS || 0
      if (usageType.includes('ZRS'))
        return REPLICATION_FACTORS?.STORAGE_ZRS || 0
      if (usageType.includes('GRS'))
        return REPLICATION_FACTORS?.STORAGE_GRS || 0
      if (usageType.includes('Disks'))
        return REPLICATION_FACTORS?.STORAGE_DISKS || 0
      return REPLICATION_FACTORS?.DEFAULT || 0
    },
    [SERVICES.DB_MYSQL]: (): number => {
      return REPLICATION_FACTORS?.DATABASE_MYSQL || 0
    },
    [SERVICES.COSMOS_DB]: (usageType: string): number => {
      if (usageType.includes('Data Stored'))
        return REPLICATION_FACTORS?.COSMOS_DB || 0
      return REPLICATION_FACTORS?.DEFAULT || 0
    },
    [SERVICES.SQL_DB]: (usageType: string): number => {
      if (containsAny(['Data Stored', 'vCore'], usageType))
        return REPLICATION_FACTORS?.SQL_DB || 0
      return REPLICATION_FACTORS?.DEFAULT || 0
    },
    [SERVICES.REDIS_CACHE]: (): number => {
      return REPLICATION_FACTORS?.REDIS_CACHE || 0
    },
  }
