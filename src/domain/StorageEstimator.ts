import FootprintEstimate from './FootprintEstimate'
import FootprintEstimator from './FootprintEstimator'
import StorageUsage from './StorageUsage'

const SSD_COEFFICIENT = 1.52

export default class StorageEstimator implements FootprintEstimator {
  private readonly data: StorageUsage[]

  constructor(data: StorageUsage[]) {
    this.data = data
  }

  estimate(): FootprintEstimate[] {
    return this.data
      .map((d: StorageUsage) => {
        // *NOTE: Assuming all months have 30 days
        const usageGb = d.sizeGb * 30; 
        //apply formula -> TBh * 24 hrs
        const estimatedWattage = usageGb / 1000 * SSD_COEFFICIENT * 24; 

        return {
          timestamp: d.timestamp,
          wattage: estimatedWattage,
          co2: estimatedWattage * 0.70704 / 1000
        }
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

