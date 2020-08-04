import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import ComputeEstimator from '@domain/ComputeEstimator'
import ComputeUsage from '@domain/ComputeUsage'

export default abstract class ServiceWithCPUUtilization implements ICloudService {
  private readonly estimator: ComputeEstimator

  protected constructor() {
    this.estimator = new ComputeEstimator()
  }

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    return this.estimator.estimate(usage, region)
  }

  abstract getUsage(start: Date, end: Date): Promise<ComputeUsage[]>
  abstract serviceName: string
}
