import FootprintEstimate from './FootprintEstimate'
import FootprintEstimator from './FootprintEstimator'
import StorageUsage from './StorageUsage'

export class StorageEstimator implements FootprintEstimator {
  coefficient: number
  wattage_carbon_ratio: number
  power_usage_effectiveness: number

  constructor(coefficient: number, us_wattage_carbon_ratio: number, power_usage_effectiveness: number) {
    this.coefficient = coefficient
    this.wattage_carbon_ratio = us_wattage_carbon_ratio
    this.power_usage_effectiveness = power_usage_effectiveness
  }

  estimate(data: StorageUsage[]): FootprintEstimate[] {
    return data.map((d: StorageUsage) => {
      const estimatedWattHours = this.estimateWattHours(d.sizeGb)

      return {
        timestamp: d.timestamp,
        wattHours: estimatedWattHours,
        co2e: this.estimateCo2(estimatedWattHours),
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

  private estimateCo2(estimatedWattHours: number) {
    // This function does the following:
    // 1. Multiplies the estimated watt-hours by the average CO2e emissions in the US, provided by the EPA
    // 2. Divides that by 1000 to get the estimated CO2e emissions in kilograms (Kgs)
    return (estimatedWattHours * this.wattage_carbon_ratio) / 1000
  }
}
