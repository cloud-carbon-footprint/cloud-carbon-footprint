/*
 * © 2021 ThoughtWorks, Inc.
 */

import ICloudService from './ICloudService'
import FootprintEstimate from './FootprintEstimate'
import ComputeEstimator from './ComputeEstimator'
import ComputeUsage from './ComputeUsage'
import Cost from './Cost'
import { CloudConstantsEmissionsFactors } from './FootprintEstimationConstants'
import CloudConstantsUsage from './CloudConstantsUsage'

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
    constants: CloudConstantsUsage,
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
