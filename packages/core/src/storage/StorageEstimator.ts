/*
 * © 2021 ThoughtWorks, Inc.
 */

import { CloudConstantsEmissionsFactors, CloudConstants } from '../cloud'
import {
  estimateCo2,
  FootprintEstimate,
  IFootprintEstimator,
} from '../footprint'
import { StorageUsage } from '.'

export class StorageEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: StorageUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[] {
    return data.map((d: StorageUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        d.terabyteHours,
        constants.powerUsageEffectiveness,
      )

      return {
        timestamp: d.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimateCo2(estimatedKilowattHours, region, emissionsFactors),
      }
    })
  }

  private estimateKilowattHours(
    terabyteHours: number,
    powerUsageEffectiveness: number,
  ) {
    // This function multiplies the usage in terabyte hours this by the SSD or HDD co-efficient,
    // then by PUE to account for extra power used by data center (lights, infrastructure, etc.), then converts to kilowatt-hours
    return (terabyteHours * this.coefficient * powerUsageEffectiveness) / 1000
  }
}
