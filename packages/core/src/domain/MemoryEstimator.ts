/*
 * © 2021 ThoughtWorks, Inc.
 */

import IFootprintEstimator from './IFootprintEstimator'
import FootprintEstimate from './FootprintEstimate'
import { CLOUD_CONSTANTS, estimateCo2 } from './FootprintEstimationConstants'
import MemoryUsage from './MemoryUsage'

export default class MemoryEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: MemoryUsage[],
    region: string,
    cloudProvider: string,
  ): FootprintEstimate[] {
    return data.map((data: MemoryUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        data.gigabyteHours,
        cloudProvider,
        region,
      )
      const estimatedCO2Emissions = estimateCo2(
        estimatedKilowattHours,
        cloudProvider,
        region,
      )
      return {
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCO2Emissions,
      }
    })
  }
  private estimateKilowattHours(
    gigabyteHours: number,
    cloudProvider: string,
    region: string,
  ) {
    // This function multiplies the usage amount in gigabyte hours by the memory coefficient then the cloud provider PUE,
    // to get estimated kilowatt hours.
    return (
      gigabyteHours *
      this.coefficient *
      CLOUD_CONSTANTS[cloudProvider].getPUE(region)
    )
  }
}
