import FootprintEstimator from '@domain/FootprintEstimator'
import FootprintEstimate from '@domain/FootprintEstimate'
import ComputeUsage from '@domain/ComputeUsage'

const MIN_WATTS = 0.55
const MAX_WATTS = 3.71

//averageCPUUtilization expected to be in percentage
const ENERGY_ESTIMATION_FORMULA = (averageCPUUtilization: number, virtualCPUHours: number) => {
  return (MIN_WATTS + (averageCPUUtilization / 100) * (MAX_WATTS - MIN_WATTS)) * virtualCPUHours
}

export default class ComputeEstimator implements FootprintEstimator {
  estimate(data: ComputeUsage[]): FootprintEstimate[] {
    return data.map((usage) => {
      const estimatedWattage = ENERGY_ESTIMATION_FORMULA(usage.cpuUtilizationAverage, usage.numberOfvCpus)
      const estimatedCO2Emissions = (estimatedWattage * 0.70704) / 1000

      return {
        timestamp: usage.timestamp,
        wattHours: estimatedWattage,
        co2e: estimatedCO2Emissions,
      }
    })
  }
}
