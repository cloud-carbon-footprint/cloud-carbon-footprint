/*
 * © 2021 Thoughtworks, Inc.
 */

import { Cost } from '../cost'
import {
  FootprintEstimate,
  ICloudService,
  CloudConstantsEmissionsFactors,
  CloudConstants,
} from '../.'
import { ComputeUsage, ComputeEstimator } from '.'

export default abstract class ServiceWithCPUUtilization
  implements ICloudService
{
  private readonly estimator: ComputeEstimator

  protected constructor() {
    this.estimator = new ComputeEstimator()
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

  abstract getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<ComputeUsage[]>
  abstract getCosts(start: Date, end: Date, region: string): Promise<Cost[]>
  abstract serviceName: string
}
