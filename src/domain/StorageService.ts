import CloudService from './CloudService'
import FootprintEstimate from './FootprintEstimate'
import { StorageEstimator } from './StorageEstimator'
import StorageUsage from './StorageUsage'
import FootprintEstimator from './FootprintEstimator'

export default abstract class StorageService implements CloudService {
  US_WATTAGE_CARBON_RATIO = 0.70704
  estimator: FootprintEstimator

  protected constructor(storageCoefficient: number) {
    this.estimator = new StorageEstimator(storageCoefficient, this.US_WATTAGE_CARBON_RATIO)
  }

  async getEstimates(start: Date, end: Date): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    return this.estimator.estimate(usage)
  }

  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class SSDStorageService extends StorageService {
  static COEFFICIENT = 1.2

  protected constructor() {
    super(SSDStorageService.COEFFICIENT)
  }

  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class HDDStorageService extends StorageService {
  static COEFFICIENT = 0.67

  protected constructor() {
    super(HDDStorageService.COEFFICIENT)
  }

  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}
