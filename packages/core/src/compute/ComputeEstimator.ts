/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  estimateCo2,
  FootprintEstimate,
  IFootprintEstimator,
} from '../footprintEstimator'
import { CloudConstantsEmissionsFactors, CloudConstants } from '../cloud'
import { ComputeUsage } from '.'

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (
  averageCPUUtilization: number,
  virtualCPUHours: number,
  minWatts: number,
  maxWatts: number,
  powerUsageEffectiveness: number,
) => {
  return (
    ((minWatts + (averageCPUUtilization / 100) * (maxWatts - minWatts)) *
      virtualCPUHours *
      powerUsageEffectiveness) /
    1000
  )
}

export default class ComputeEstimator implements IFootprintEstimator {
  estimate(
    data: ComputeUsage[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[] {
    return data.map((usage) => {
      const estimatedKilowattHours = ENERGY_ESTIMATION_FORMULA(
        usage.cpuUtilizationAverage,
        usage.numberOfvCpus,
        constants.minWatts,
        constants.maxWatts,
        constants.powerUsageEffectiveness,
      )

      const estimatedCO2Emissions = estimateCo2(
        estimatedKilowattHours,
        region,
        emissionsFactors,
      )
      return {
        timestamp: usage.timestamp,
        kilowattHours: estimatedKilowattHours,
        co2e: estimatedCO2Emissions,
        usesAverageCPUConstant: usage.usesAverageCPUConstant,
      }
    })
  }
}
