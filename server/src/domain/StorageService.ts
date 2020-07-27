import CloudService from './CloudService'
import FootprintEstimate from './FootprintEstimate'
import { StorageEstimator } from './StorageEstimator'
import StorageUsage from './StorageUsage'
import FootprintEstimator from './FootprintEstimator'
import { US_WATTAGE_CARBON_RATIO, HDDCOEFFICIENT, SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS } from './constants'

export default abstract class StorageService implements CloudService {
  estimator: FootprintEstimator

  protected constructor(storageCoefficient: number) {
    this.estimator = new StorageEstimator(storageCoefficient, US_WATTAGE_CARBON_RATIO, AWS_POWER_USAGE_EFFECTIVENESS)
  }

  async getEstimates(start: Date, end: Date): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    return this.estimator.estimate(usage)
  }

  /**
   * @returns a promise that returns an array of StorageUsage objects with timestamp per day and size in Gigabytes
   */
  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class SSDStorageService extends StorageService {
  protected constructor() {
    super(SSDCOEFFICIENT)
  }

  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class HDDStorageService extends StorageService {
  protected constructor() {
    super(HDDCOEFFICIENT)
  }

  abstract getUsage(start: Date, end: Date): Promise<StorageUsage[]>

  abstract serviceName: string
}
