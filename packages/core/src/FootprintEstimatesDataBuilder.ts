/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstants,
  FootprintEstimate,
  MemoryUsage,
  COMPUTE_PROCESSOR_TYPES,
  ComputeUsage,
} from '.'

export default abstract class FootprintEstimatesDataBuilder {
  public usageAmount: number
  public instanceType: string
  public vCpuHours: number
  public region: string
  public powerUsageEffectiveness: number
  public replicationFactor: number
  public computeProcessors: string[]
  public computeUsage: ComputeUsage
  public computeConstants: CloudConstants
  public computeFootprint: FootprintEstimate
  public memoryUsage: MemoryUsage
  public memoryConstants: CloudConstants
  public memoryFootprint: FootprintEstimate

  protected constructor(init: Partial<FootprintEstimatesDataBuilder>) {
    Object.assign(this, init)
  }

  public getComputeProcessors(
    instanceType: string,
    INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING: {
      [key: string]: string[]
    },
  ): string[] {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }
}
