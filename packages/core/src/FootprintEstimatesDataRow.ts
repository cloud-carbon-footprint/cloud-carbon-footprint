/*
 * © 2021 ThoughtWorks, Inc.
 */

import { CloudConstants, FootprintEstimate } from 'src'
import { ComputeUsage } from './compute'

export default abstract class FootprintEstimatesDataRow {
  public computeProcessors: string[]
  public vCpuHours: number
  public computeUsage: ComputeUsage
  public powerUsageEffectiveness: string
  public computeConstants: CloudConstants
  public computeFootprint: FootprintEstimate

  protected constructor(init: Partial<FootprintEstimatesDataRow>) {
    Object.assign(this, init)
  }
}
