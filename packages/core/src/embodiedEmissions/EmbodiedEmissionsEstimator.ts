/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstantsEmissionsFactors,
  estimateKwh,
  FootprintEstimate,
  IFootprintEstimator,
} from '../.'
import { EmbodiedEmissionsUsage } from '.'

export default class EmbodiedEmissionsEstimator implements IFootprintEstimator {
  serverExpectedLifespan: number

  constructor(serverExpectedLifespan: number) {
    this.serverExpectedLifespan = serverExpectedLifespan
  }

  estimate(
    data: EmbodiedEmissionsUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate[] {
    return data.map((data: EmbodiedEmissionsUsage) => {
      const estimatedCO2Emissions = this.estimateCo2e(
        data.usageTimePeriod,
        data.instancevCpu,
        data.largestInstancevCpu,
        data.scopeThreeEmissions,
      )

      const estimatedKilowattHours = estimateKwh(
        estimatedCO2Emissions,
        region,
        emissionsFactors,
      )

      return {
        co2e: estimatedCO2Emissions,
        timestamp: data.timestamp,
        kilowattHours: estimatedKilowattHours,
      }
    })
  }
  private estimateCo2e(
    usageTimePeriod: number,
    instancevCpu: number,
    largestInstancevCpu: number,
    scopeThreeEmissions: number,
  ) {
    //Source: https://github.com/Green-Software-Foundation/software_carbon_intensity/blob/f8ca3cb7b3195e9d3610ec58670a0d47ea7164e5/Software_Carbon_Intensity/Software_Carbon_Intensity_Specification.md?plain=1#L131
    return (
      scopeThreeEmissions *
      (usageTimePeriod / this.serverExpectedLifespan) *
      (instancevCpu / largestInstancevCpu)
    )
  }
}
