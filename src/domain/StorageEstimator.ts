import FootprintEstimate from './FootprintEstimate'
import FootprintEstimator from './FootprintEstimator'
import StorageUsage from './StorageUsage'

export class StorageEstimator implements FootprintEstimator {
  coefficient: number
  wattage_carbon_ratio: number

  constructor(coefficient: number, us_wattage_carbon_ratio: number) {
    this.coefficient = coefficient
    this.wattage_carbon_ratio = us_wattage_carbon_ratio
  }

  estimate(data: StorageUsage[]): FootprintEstimate[] {
    return data.map((d: StorageUsage) => {
      const usageGb = this.estimateMonthlyUsage(d.sizeGb)
      const estimatedWattage = this.estimateWattage(usageGb)

      return {
        timestamp: d.timestamp,
        wattHours: estimatedWattage,
        co2e: this.estimateCo2(estimatedWattage),
      }
    })
  }

  private estimateWattage(usageGb: number) {
    return (usageGb / 1000) * this.coefficient * 24
  }

  private estimateCo2(estimatedWattage: number) {
    return (estimatedWattage * this.wattage_carbon_ratio) / 1000
  }

  private estimateMonthlyUsage(sizeGb: number) {
    // *NOTE: Assuming all months have 30 days
    return sizeGb * 30
  }
}
