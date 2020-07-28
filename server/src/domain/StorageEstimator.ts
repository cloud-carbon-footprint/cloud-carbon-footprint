import FootprintEstimate from './FootprintEstimate'
import FootprintEstimator from './FootprintEstimator'
import StorageUsage from './StorageUsage'
import { AWS_REGIONS_WATT_HOURS_CARBON_RATIO } from './constants'

export class StorageEstimator implements FootprintEstimator {
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
        co2e: this.estimateCo2(estimatedWattHours, region),
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

  private estimateCo2(estimatedWattHours: number, region: string) {
    // This function multiplies the estimated watt-hours by the average CO2e emissions (Kgs) in the region being estimated,
    // as provided by IEA and other energy reports
    return estimatedWattHours * AWS_REGIONS_WATT_HOURS_CARBON_RATIO[region]
  }
}
