/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import IFootprintEstimator from '@domain/IFootprintEstimator'
import FootprintEstimate from '@domain/FootprintEstimate'
import ComputeUsage from '@domain/ComputeUsage'
import { CLOUD_CONSTANTS, estimateCo2 } from './FootprintEstimationConstants'

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (averageCPUUtilization: number, virtualCPUHours: number, cloudProvider: string) => {
  const maxWatts = CLOUD_CONSTANTS[cloudProvider].MAX_WATTS
  const minWatts = CLOUD_CONSTANTS[cloudProvider].MIN_WATTS
  const powerUsageEffectiveness = CLOUD_CONSTANTS[cloudProvider].POWER_USAGE_EFFECTIVENESS
  return (minWatts + (averageCPUUtilization / 100) * (maxWatts - minWatts)) * virtualCPUHours * powerUsageEffectiveness
}

export default class ComputeEstimator implements IFootprintEstimator {
  estimate(data: ComputeUsage[], region: string, cloudProvider: string): FootprintEstimate[] {
    return data.map((usage) => {
      const estimatedWattHours = ENERGY_ESTIMATION_FORMULA(
        usage.cpuUtilizationAverage,
        usage.numberOfvCpus,
        cloudProvider,
      )

      const estimatedCO2Emissions = estimateCo2(estimatedWattHours, cloudProvider, region)
      return {
        timestamp: usage.timestamp,
        wattHours: estimatedWattHours,
        co2e: estimatedCO2Emissions,
        usesAverageCPUConstant: usage.usesAverageCPUConstant,
      }
    })
  }
}
