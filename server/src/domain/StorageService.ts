import ICloudService from './ICloudService'
import FootprintEstimate from './FootprintEstimate'
import { StorageEstimator } from './StorageEstimator'
import StorageUsage from './StorageUsage'
import IFootprintEstimator from './IFootprintEstimator'
import { AWS_POWER_USAGE_EFFECTIVENESS, HDDCOEFFICIENT, SSDCOEFFICIENT } from './FootprintEstimationConfig'

export default abstract class StorageService implements ICloudService {
  estimator: IFootprintEstimator

  protected constructor(storageCoefficient: number) {
    this.estimator = new StorageEstimator(storageCoefficient, AWS_POWER_USAGE_EFFECTIVENESS)
  }

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end, region)
    return this.estimator.estimate(usage, region)
  }

  /**
   * @returns a promise that returns an array of StorageUsage objects with timestamp per day and size in Gigabytes
   */
  abstract getUsage(start: Date, end: Date, region: string): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class SSDStorageService extends StorageService {
  protected constructor() {
    super(SSDCOEFFICIENT)
  }

  abstract getUsage(start: Date, end: Date, region: string): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class HDDStorageService extends StorageService {
  protected constructor() {
    super(HDDCOEFFICIENT)
  }

  abstract getUsage(start: Date, end: Date, region: string): Promise<StorageUsage[]>

  abstract serviceName: string
}
