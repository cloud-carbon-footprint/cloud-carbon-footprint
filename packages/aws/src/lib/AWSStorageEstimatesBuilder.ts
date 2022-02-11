/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstants,
  FootprintEstimate,
  FootprintEstimatesDataBuilder,
  StorageEstimator,
  StorageUsage,
} from '@cloud-carbon-footprint/core'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { convertGigabyteHoursToTerabyteHours } from '@cloud-carbon-footprint/common'
import { EBSCurrentComputeOptimizerRecommendation } from './Recommendations/ComputeOptimizer'

export default class AWSStorageEstimatesBuilder extends FootprintEstimatesDataBuilder {
  constructor(
    rowData: EBSCurrentComputeOptimizerRecommendation,
    storageEstimator: StorageEstimator,
  ) {
    super(rowData)

    this.region = rowData.region
    this.powerUsageEffectiveness = AWS_CLOUD_CONSTANTS.getPUE(this.region)
    this.storageUsage = this.getStorageUsage()
    this.storageConstants = this.getStorageConstants()
    this.storageFootprint = this.getStorageFootprint(
      storageEstimator,
      this.storageUsage,
      this.storageConstants,
      this.region,
    )
    this.volumeSize = rowData.volumeSize
  }

  private getStorageUsage(): StorageUsage {
    return {
      terabyteHours: convertGigabyteHoursToTerabyteHours(this.volumeSize),
    }
  }

  private getStorageConstants(): CloudConstants {
    return {
      powerUsageEffectiveness: this.powerUsageEffectiveness,
      replicationFactor: 2, //EBS replication factor
    }
  }

  private getStorageFootprint(
    storageEstimator: StorageEstimator,
    storageUsage: StorageUsage,
    storageConstants: CloudConstants,
    region: string,
  ): FootprintEstimate {
    return storageEstimator.estimate(
      [storageUsage],
      region,
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      storageConstants,
    )[0]
  }
}
