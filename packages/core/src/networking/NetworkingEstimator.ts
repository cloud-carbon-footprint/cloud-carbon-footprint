/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstantsEmissionsFactors,
  CloudConstants,
  estimateCo2,
  FootprintEstimate,
  IFootprintEstimator,
} from '../.'
import { NetworkingUsage } from '.'

export default class NetworkingEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: NetworkingUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
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
