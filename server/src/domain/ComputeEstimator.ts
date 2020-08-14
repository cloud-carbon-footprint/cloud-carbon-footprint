import IFootprintEstimator from '@domain/IFootprintEstimator'
import FootprintEstimate from '@domain/FootprintEstimate'
import ComputeUsage from '@domain/ComputeUsage'
import { AWS_POWER_USAGE_EFFECTIVENESS, estimateCo2, MAX_WATTS, MIN_WATTS } from './FootprintEstimationConfig'

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (averageCPUUtilization: number, virtualCPUHours: number) => {
  return (
    (MIN_WATTS + (averageCPUUtilization / 100) * (MAX_WATTS - MIN_WATTS)) *
    virtualCPUHours *
    AWS_POWER_USAGE_EFFECTIVENESS
  )
}

export default class ComputeEstimator implements IFootprintEstimator {
  estimate(data: ComputeUsage[], region: string): FootprintEstimate[] {
    return data.map((usage) => {
      const estimatedWattage = ENERGY_ESTIMATION_FORMULA(usage.cpuUtilizationAverage, usage.numberOfvCpus)
      const estimatedCO2Emissions = estimateCo2(estimatedWattage, region)

      return {
        timestamp: usage.timestamp,
        wattHours: estimatedWattage,
        co2e: estimatedCO2Emissions,
      }
    })
  }
}
