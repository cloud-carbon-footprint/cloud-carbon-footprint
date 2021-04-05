/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import FootprintEstimate from './FootprintEstimate'
import IFootprintEstimator from './IFootprintEstimator'
import StorageUsage from './StorageUsage'
import { CLOUD_CONSTANTS, estimateCo2 } from './FootprintEstimationConstants'

export class StorageEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: StorageUsage[],
    region: string,
    cloudProvider: string,
  ): FootprintEstimate[] {
    return data.map((d: StorageUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        d.terabyteHours,
        cloudProvider,
        region,
      )

      return {
        timestamp: d.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimateCo2(estimatedKilowattHours, cloudProvider, region),
      }
    })
  }

  private estimateKilowattHours(
    terabyteHours: number,
    cloudProvider: string,
    region: string,
  ) {
    // This function multiplies the usage in terabyte hours this by the SSD or HDD co-efficient,
    // then by PUE to account for extra power used by data center (lights, infrastructure, etc.), then converts to kilowatt-hours
    return (
      (terabyteHours *
        this.coefficient *
        CLOUD_CONSTANTS[cloudProvider].getPUE(region)) /
      1000
    )
  }
}
