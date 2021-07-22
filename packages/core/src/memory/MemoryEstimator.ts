/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstantsEmissionsFactors,
  CloudConstants,
  FootprintEstimate,
  IFootprintEstimator,
  estimateCo2,
} from '../.'
import { MemoryUsage } from '.'

export default class MemoryEstimator implements IFootprintEstimator {
  coefficient: number

  constructor(coefficient: number) {
    this.coefficient = coefficient
  }

  estimate(
    data: MemoryUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[] {
    return data.map((data: MemoryUsage) => {
      const estimatedKilowattHours = this.estimateKilowattHours(
        data.gigabyteHours,
        constants.powerUsageEffectiveness,
        constants.replicationFactor,
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
    replicationFactor = 1,
  ) {
    // This function multiplies the usage amount in gigabyte hours by the memory coefficient then the cloud provider PUE,
    // to get estimated kilowatt hours.
    return (
      gigabyteHours *
      this.coefficient *
      powerUsageEffectiveness *
      replicationFactor
    )
  }
}
