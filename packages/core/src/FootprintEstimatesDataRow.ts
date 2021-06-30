/*
 * © 2021 ThoughtWorks, Inc.
 */

import { CloudConstants, FootprintEstimate, ComputeUsage } from '.'

export default abstract class FootprintEstimatesDataRow {
  public computeProcessors: string[]
  public vCpuHours: number
  public computeUsage: ComputeUsage
  public powerUsageEffectiveness: number
  public computeConstants: CloudConstants
  public computeFootprint: FootprintEstimate
  // public memoryUsage: MemoryUsage
  // public memoryConstants: CloudConstants
  // public memoryFootprint: FootprintEstimate

  protected constructor(init: Partial<FootprintEstimatesDataRow>) {
    Object.assign(this, init)
  }
}
