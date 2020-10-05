import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import ComputeEstimator from '@domain/ComputeEstimator'
import ComputeUsage from '@domain/ComputeUsage'
import Cost from '@domain/Cost'

export default abstract class ServiceWithCPUUtilization implements ICloudService {
  private readonly estimator: ComputeEstimator

  protected constructor() {
    this.estimator = new ComputeEstimator()
  }

  async getEstimates(start: Date, end: Date, region: string, cloudProvider: string): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end, region)
    return this.estimator.estimate(usage, region, cloudProvider)
  }

  abstract getUsage(start: Date, end: Date, region: string): Promise<ComputeUsage[]>
  abstract getCosts(start: Date, end: Date, region: string): Promise<Cost[]>
  abstract serviceName: string
}
