/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstants,
  FootprintEstimate,
  MemoryUsage,
  ComputeUsage,
  StorageUsage,
} from '.'

export default abstract class FootprintEstimatesDataBuilder {
  public usageAmount: number
  public instanceType: string
  public usageType: string
  public vCpuHours: number
  public gpuHours: number
  public region: string
  public powerUsageEffectiveness: number
  public replicationFactor: number
  public computeProcessors: string[]
  public gpuComputeProcessors: string[]
  public volumeSize: number
  public computeUsage: ComputeUsage
  public computeConstants: CloudConstants
  public computeFootprint: FootprintEstimate
  public memoryUsage: MemoryUsage
  public memoryConstants: CloudConstants
  public memoryFootprint: FootprintEstimate
  public storageUsage: StorageUsage
  public storageConstants: CloudConstants
  public storageFootprint: FootprintEstimate

  protected constructor(init: Partial<FootprintEstimatesDataBuilder>) {
    Object.assign(this, init)
  }
}
