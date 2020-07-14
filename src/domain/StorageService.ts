import CloudService from './CloudService'
import FootprintEstimate from './FootprintEstimate'
import { StorageEstimator } from './StorageEstimator'
import StorageUsage from './StorageUsage'
import FootprintEstimator from './FootprintEstimator'

export default abstract class StorageService implements CloudService {
  SSD_COEFFICIENT = 1.52
  US_WATTAGE_CARBON_RATIO = 0.70704
  estimator: FootprintEstimator

  constructor() {
    this.estimator = new StorageEstimator(this.SSD_COEFFICIENT, this.US_WATTAGE_CARBON_RATIO)
  }

  async getEstimates(start: Date, end: Date): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    return this.estimator.estimate(usage)
  }

  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}
