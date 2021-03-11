/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import IFootprintEstimator from './IFootprintEstimator'
import FootprintEstimate from './FootprintEstimate'
import ComputeUsage from './ComputeUsage'
import { CLOUD_CONSTANTS, estimateCo2 } from './FootprintEstimationConstants'

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (
  averageCPUUtilization: number,
  virtualCPUHours: number,
  cloudProvider: string,
  region: string,
  computeProcessors: string[] = [],
) => {
  const minWatts = CLOUD_CONSTANTS[cloudProvider].getMinWatts(computeProcessors)
  const maxWatts = CLOUD_CONSTANTS[cloudProvider].getMaxWatts(computeProcessors)
  const powerUsageEffectiveness = CLOUD_CONSTANTS[cloudProvider].getPUE(region)
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
    cloudProvider: string,
    computeProcessors?: string[],
  ): FootprintEstimate[] {
    return data.map((usage) => {
      const estimatedKilowattHours = ENERGY_ESTIMATION_FORMULA(
        usage.cpuUtilizationAverage,
        usage.numberOfvCpus,
        cloudProvider,
        region,
        computeProcessors,
      )

      const estimatedCO2Emissions = estimateCo2(
        estimatedKilowattHours,
        cloudProvider,
        region,
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
