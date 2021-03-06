/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import FootprintEstimate from './FootprintEstimate'
import IFootprintEstimator from './IFootprintEstimator'
import StorageUsage from './StorageUsage'
import {
  CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
  CLOUD_CONSTANTS,
} from './FootprintEstimationConstants'

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
        co2e: this.estimateCo2(estimatedKilowattHours, region, cloudProvider),
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

  private estimateCo2(
    estimatedKilowattHours: number,
    region: string,
    cloudProvider: string,
  ) {
    // This function multiplies the estimated watt-hours by the average CO2e emissions (Kgs) in the region being estimated,
    // as provided by IEA and other energy reports
    return (
      estimatedKilowattHours *
      CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH[cloudProvider][region]
    )
  }
}
