/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  CloudConstantsEmissionsFactors,
  CloudConstantsUsage,
  NetworkingUsage,
  estimateCo2,
  FootprintEstimate,
  IFootprintEstimator,
} from '.'

export default class NetworkingEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: NetworkingUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstantsUsage,
  ): FootprintEstimate[] {
    return data.map((data: NetworkingUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        data.gigabytes,
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
    gigaBytes: number,
    powerUsageEffectiveness: number,
  ) {
    // This function multiplies the usage amount in gigabytes by the networking coefficient, then the cloud provider PUE,
    // to get estimated kilowatt hours.
    return gigaBytes * this.coefficient * powerUsageEffectiveness
  }
}
