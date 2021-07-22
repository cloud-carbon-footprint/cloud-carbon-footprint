/*
 * © 2021 Thoughtworks, Inc.
 */

import { Cost } from '../cost'
import {
  CloudConstants,
  CloudConstantsEmissionsFactors,
  IFootprintEstimator,
  FootprintEstimate,
  ICloudService,
} from '../.'
import { StorageEstimator, StorageUsage } from '.'

export default abstract class StorageService implements ICloudService {
  estimator: IFootprintEstimator

  protected constructor(storageCoefficient: number) {
    this.estimator = new StorageEstimator(storageCoefficient)
  }

  async getEstimates(
    start: Date,
    end: Date,
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end, region)
    return this.estimator.estimate(usage, region, emissionsFactors, constants)
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
  coefficient: number

  protected constructor(coefficient: number) {
    super(coefficient) // ssdCoefficient
  }

  abstract getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<StorageUsage[]>

  abstract serviceName: string
}

export abstract class HDDStorageService extends StorageService {
  coefficient: number

  protected constructor(coefficient: number) {
    super(coefficient) // hddCoefficient
  }

  abstract getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<StorageUsage[]>

  abstract serviceName: string
}
