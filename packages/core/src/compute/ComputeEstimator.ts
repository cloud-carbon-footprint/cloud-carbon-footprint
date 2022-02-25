/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  estimateCo2,
  FootprintEstimate,
  IFootprintEstimator,
  CloudConstantsEmissionsFactors,
  CloudConstants,
} from '../.'
import { ComputeUsage } from '.'

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (
  averageCPUUtilization: number,
  virtualCPUHours: number,
  minWatts: number,
  maxWatts: number,
  powerUsageEffectiveness: number,
  replicationFactor = 1,
  averageWatts?: number,
) => {
  const calculatedAverageWatts = averageWatts
    ? averageWatts
    : minWatts + (averageCPUUtilization / 100) * (maxWatts - minWatts)
  return (
    (calculatedAverageWatts *
      virtualCPUHours *
      powerUsageEffectiveness *
      replicationFactor) /
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
        usage.vCpuHours,
        constants.minWatts,
        constants.maxWatts,
        constants.powerUsageEffectiveness,
        constants.replicationFactor,
        constants.averageWatts,
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
