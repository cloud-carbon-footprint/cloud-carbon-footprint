/*
 * © 2021 Thoughtworks, Inc.
 */

import { ReplicationFactorsForService } from '@cloud-carbon-footprint/core'
import { containsAny } from '@cloud-carbon-footprint/common'
import { GCP_CLOUD_CONSTANTS } from '../domain'
import { GCP_DUAL_REGIONS, GCP_MULTI_REGIONS } from './GCPRegions'

const { REPLICATION_FACTORS } = GCP_CLOUD_CONSTANTS

enum SERVICES {
  CLOUD_STORAGE = 'Cloud Storage',
  COMPUTE_ENGINE = 'Compute Engine',
  CLOUD_FILESTORE = 'Cloud Filestore',
  CLOUD_SQL = 'Cloud SQL',
  CLOUD_MEMORYSTORE_FOR_REDIS = 'Cloud Memorystore for Redis',
  CLOUD_SPANNER = 'Cloud Spanner',
  KUBERNETES_ENGINE = 'Kubernetes Engine',
  CLOUD_COMPOSER = 'Cloud Composer',
}

export const GCP_REPLICATION_FACTORS_FOR_SERVICES: ReplicationFactorsForService =
  {
    [SERVICES.CLOUD_STORAGE]: (usageType: string): number => {
      if (usageType.includes('Dual-region'))
        return REPLICATION_FACTORS.CLOUD_STORAGE_DUAL_REGION
      if (usageType.includes('Multi-region')) {
        return REPLICATION_FACTORS.CLOUD_STORAGE_MULTI_REGION
      }
      return REPLICATION_FACTORS.CLOUD_STORAGE_SINGLE_REGION
    },
    [SERVICES.COMPUTE_ENGINE]: (usageType: string, region?: string): number => {
      if (usageType.includes('Regional'))
        return REPLICATION_FACTORS.COMPUTE_ENGINE_REGIONAL_DISKS // 2
      if (containsAny(['Snapshot', 'Image'], usageType)) {
        const multiRegions = Object.values(GCP_MULTI_REGIONS)
        const dualRegions = Object.values(GCP_DUAL_REGIONS)
        if (multiRegions.includes(region as GCP_MULTI_REGIONS))
          return REPLICATION_FACTORS.CLOUD_STORAGE_MULTI_REGION
        if (dualRegions.includes(region as GCP_DUAL_REGIONS))
          return REPLICATION_FACTORS.CLOUD_STORAGE_DUAL_REGION
        return REPLICATION_FACTORS.CLOUD_STORAGE_SINGLE_REGION
      }
      return REPLICATION_FACTORS.DEFAULT
    },
    [SERVICES.CLOUD_FILESTORE]: (): number => {
      return REPLICATION_FACTORS.CLOUD_FILESTORE
    },
    [SERVICES.CLOUD_SQL]: (usageType: string): number => {
      if (
        usageType.includes('Regional - Standard storage') ||
        usageType.includes('HA')
      ) {
        return REPLICATION_FACTORS.CLOUD_SQL_HIGH_AVAILABILITY
      }
      return REPLICATION_FACTORS.DEFAULT
    },
    [SERVICES.CLOUD_MEMORYSTORE_FOR_REDIS]: (usageType: string): number => {
      if (usageType.includes('Standard'))
        return REPLICATION_FACTORS.CLOUD_MEMORY_STORE_REDIS
      return REPLICATION_FACTORS.DEFAULT
    },
    [SERVICES.CLOUD_SPANNER]: (usageType: string): number => {
      if (usageType.includes('Regional'))
        return REPLICATION_FACTORS.CLOUD_SPANNER_SINGLE_REGION
      if (usageType.includes('Multi-Region'))
        // Not sure how it will come from GCP, we don't have any multi-region
        return REPLICATION_FACTORS.CLOUD_SPANNER_MULTI_REGION
      return REPLICATION_FACTORS.DEFAULT
    },
    [SERVICES.KUBERNETES_ENGINE]: (usageType: string): number => {
      if (
        usageType.includes('Clusters') &&
        (usageType.includes('Regional') || usageType.includes('Autopilot'))
      )
        return REPLICATION_FACTORS.KUBERNETES_ENGINE
      return REPLICATION_FACTORS.DEFAULT
    },
    [SERVICES.CLOUD_COMPOSER]: (usageType: string): number => {
      if (usageType.includes('Storage') || usageType.includes('storage'))
        return REPLICATION_FACTORS.CLOUD_STORAGE_SINGLE_REGION
      return REPLICATION_FACTORS.DEFAULT
    },
  }
