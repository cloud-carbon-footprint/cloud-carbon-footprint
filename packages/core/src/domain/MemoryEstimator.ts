/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  CloudConstantsEmissionsFactors,
  CloudConstantsUsage,
  MemoryUsage,
  estimateCo2,
  FootprintEstimate,
  IFootprintEstimator,
} from '.'

export default class MemoryEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: MemoryUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstantsUsage,
  ): FootprintEstimate[] {
    return data.map((data: MemoryUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        data.gigabyteHours,
        constants.powerUsageEffectiveness,
      )
      const estimatedCO2Emissions = estimateCo2(
        estimatedKilowattHours,
        region,
        emissionsFactors,
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
    powerUsageEffectiveness: number,
  ) {
    // This function multiplies the usage amount in gigabyte hours by the memory coefficient then the cloud provider PUE,
    // to get estimated kilowatt hours.
    return gigabyteHours * this.coefficient * powerUsageEffectiveness
  }
}
