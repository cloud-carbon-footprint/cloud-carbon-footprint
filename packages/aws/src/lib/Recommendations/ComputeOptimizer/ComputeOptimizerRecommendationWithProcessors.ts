/*
 * © 2021 Thoughtworks, Inc.
 */

import ComputeOptimizerRecommendation from './ComputeOptimizerRecommendation'

export default abstract class ComputeOptimizerRecommendationWithProcessors extends ComputeOptimizerRecommendation {
  public abstract vCpuHours: number
  public abstract getComputeProcessors(): string[]
  public abstract getGPUComputeProcessors(): string[]
}
