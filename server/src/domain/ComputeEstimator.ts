import FootprintEstimator from '@domain/FootprintEstimator'
import FootprintEstimate from '@domain/FootprintEstimate'
import ComputeUsage from '@domain/ComputeUsage'
import { MAX_WATTS, MIN_WATTS, US_WATTAGE_CARBON_RATIO, AWS_POWER_USAGE_EFFECTIVENESS } from './constants'

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (averageCPUUtilization: number, virtualCPUHours: number) => {
  return (
    (MIN_WATTS + (averageCPUUtilization / 100) * (MAX_WATTS - MIN_WATTS)) *
    virtualCPUHours *
    AWS_POWER_USAGE_EFFECTIVENESS
  )
}

export default class ComputeEstimator implements FootprintEstimator {
  estimate(data: ComputeUsage[]): FootprintEstimate[] {
    return data.map((usage) => {
      const estimatedWattage = ENERGY_ESTIMATION_FORMULA(usage.cpuUtilizationAverage, usage.numberOfvCpus)
      const estimatedCO2Emissions = (estimatedWattage * US_WATTAGE_CARBON_RATIO) / 1000

      return {
        timestamp: usage.timestamp,
        wattHours: estimatedWattage,
        co2e: estimatedCO2Emissions,
      }
    })
  }
}
