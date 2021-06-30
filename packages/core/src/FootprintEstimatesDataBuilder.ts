/*
 * © 2021 ThoughtWorks, Inc.
 */

import { CloudConstants, FootprintEstimate, ComputeUsage, MemoryUsage } from '.'

export default abstract class FootprintEstimatesDataBuilder {
  public computeProcessors: string[]
  public vCpuHours: number
  public computeUsage: ComputeUsage
  public powerUsageEffectiveness: number
  public computeConstants: CloudConstants
  public computeFootprint: FootprintEstimate
  public instanceType: string
  public usageAmount: number
  public memoryUsage: MemoryUsage
  public memoryConstants: CloudConstants
  public memoryFootprint: FootprintEstimate

  protected constructor(init: Partial<FootprintEstimatesDataBuilder>) {
    Object.assign(this, init)
  }
}
