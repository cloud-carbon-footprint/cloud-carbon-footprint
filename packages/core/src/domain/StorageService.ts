/*
 * © 2021 ThoughtWorks, Inc.
 */

import ICloudService from './ICloudService'
import FootprintEstimate from './FootprintEstimate'
import { StorageEstimator } from './StorageEstimator'
import StorageUsage from './StorageUsage'
import IFootprintEstimator from './IFootprintEstimator'
import { CLOUD_CONSTANTS } from './FootprintEstimationConstants'
import Cost from './Cost'

export default abstract class StorageService implements ICloudService {
  estimator: IFootprintEstimator

  protected constructor(storageCoefficient: number) {
    this.estimator = new StorageEstimator(storageCoefficient)
  }

  async getEstimates(
    start: Date,
    end: Date,
    region: string,
    cloudProvider: string,
  ): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end, region)
    return this.estimator.estimate(usage, region, cloudProvider)
  }

  /**
   * @returns a promise that returns an array of StorageUsage objects with timestamp per day and size in Gigabytes
   */
  abstract getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<StorageUsage[]>
  abstract getCosts(start: Date, end: Date, region: string): Promise<Cost[]>

  abstract serviceName: string
}

export abstract class SSDStorageService extends StorageService {
  protected constructor() {
    super(CLOUD_CONSTANTS['AWS'].SSDCOEFFICIENT)
  }

  abstract getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class HDDStorageService extends StorageService {
  protected constructor() {
    super(CLOUD_CONSTANTS['AWS'].HDDCOEFFICIENT)
  }

  abstract getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<StorageUsage[]>

  abstract serviceName: string
}
