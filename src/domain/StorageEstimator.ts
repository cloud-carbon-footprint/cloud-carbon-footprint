import FootprintEstimate from './FootprintEstimate'
import FootprintEstimator from './FootprintEstimator'
import StorageUsage from './StorageUsage'

const SSD_COEFFICIENT = 1.52
const US_WATTAGE_CARBON_RATIO = 0.70704

export class StorageEstimator implements FootprintEstimator {
  estimate(data: StorageUsage[]): FootprintEstimate[] {
    return data.map((d: StorageUsage) => {
      const usageGb = StorageEstimator.estimateMonthlyUsage(d.sizeGb)
      const estimatedWattage = StorageEstimator.estimateWattage(usageGb)

      return {
        timestamp: d.timestamp,
        wattHours: estimatedWattage,
        co2e: StorageEstimator.estimateCo2(estimatedWattage),
      }
    })
  }

  private static estimateWattage(usageGb: number) {
    return (usageGb / 1000) * SSD_COEFFICIENT * 24
  }

  private static estimateCo2(estimatedWattage: number) {
    return (estimatedWattage * US_WATTAGE_CARBON_RATIO) / 1000
  }

  private static estimateMonthlyUsage(sizeGb: number) {
    // *NOTE: Assuming all months have 30 days
    return sizeGb * 30
  }
}
