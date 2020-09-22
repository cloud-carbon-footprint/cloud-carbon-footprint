import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import Cost from '@domain/Cost'

export default class ComputeEngine extends ServiceWithCPUUtilization {
  serviceName = 'computeEngine'

  constructor() {
    super()
  }

  async getUsage(start: Date, end: Date, region: string): Promise<ComputeUsage[]> {
    throw new Error(`getUsage not Implemented. Called with start: ${start}, end: ${end}, region:${region}`)
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    throw new Error(`getCosts not Implemented. Called with start: ${start}, end: ${end}, region:${region}`)
  }
}
