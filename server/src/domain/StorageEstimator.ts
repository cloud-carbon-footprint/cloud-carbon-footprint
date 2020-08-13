import FootprintEstimate from './FootprintEstimate'
import IFootprintEstimator from './IFootprintEstimator'
import StorageUsage from './StorageUsage'
import { estimateCo2 } from './FootprintEstimationConfig'

export class StorageEstimator implements IFootprintEstimator {
  coefficient: number
  power_usage_effectiveness: number

  constructor(coefficient: number, power_usage_effectiveness: number) {
    this.coefficient = coefficient
    this.power_usage_effectiveness = power_usage_effectiveness
  }

  estimate(data: StorageUsage[], region: string): FootprintEstimate[] {
    return data.map((d: StorageUsage) => {
      const estimatedWattHours = this.estimateWattHours(d.sizeGb)

      return {
        timestamp: d.timestamp,
        wattHours: estimatedWattHours,
        co2e: estimateCo2(estimatedWattHours, region),
      }
    })
  }

  private estimateWattHours(usageGb: number) {
    // This function does the following:
    // 1. Convert the used gigabytes to terabytes
    // 2. Multiplies this by the SSD or HDD co-efficient
    // 3. Multiplies this to get the watt-hours in a single day.
    // 4. Multiples this by PUE to account for extra power used by data center (lights, infrastructure, etc.)
    return (usageGb / 1000) * this.coefficient * 24 * this.power_usage_effectiveness
  }
}
