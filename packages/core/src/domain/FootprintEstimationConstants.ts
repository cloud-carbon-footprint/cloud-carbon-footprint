/*
 * © 2021 ThoughtWorks, Inc.
 */
import { median } from 'ramda'
import { COMPUTE_PROCESSOR_TYPES } from './ComputeProcessorTypes'

export type CloudConstantsByProvider = {
  SSDCOEFFICIENT: number
  HDDCOEFFICIENT: number
  MEMORY_AVG?: number
  MEMORY_BY_COMPUTE_PROCESSOR?: { [key: string]: number }
  getMemory?: (computeProcessors?: string[]) => number
  MIN_WATTS_AVG?: number
  MIN_WATTS_MEDIAN?: number
  MIN_WATTS_BY_COMPUTE_PROCESSOR: { [key: string]: number }
  getMinWatts: (computeProcessors?: string[]) => number
  MAX_WATTS_AVG?: number
  MAX_WATTS_MEDIAN?: number
  MAX_WATTS_BY_COMPUTE_PROCESSOR: { [key: string]: number }
  getMaxWatts: (computeProcessors?: string[]) => number
  PUE_AVG: number
  NETWORKING_COEFFICIENT: number
  MEMORY_COEFFICIENT?: number
  PUE_TRAILING_TWELVE_MONTH?: { [key: string]: number }
  getPUE: (region?: string) => number
  AVG_CPU_UTILIZATION_2020: number
}

export type CloudConstantsEmissionsFactors = {
  [region: string]: number
}

export const US_NERC_REGIONS_EMISSIONS_FACTORS: {
  [nercRegion: string]: number
} = {
  RFC: 0.000440187,
  SERC: 0.000415755,
  WECC: 0.000350861,
  MRO: 0.00047223,
  TRE: 0.000396293,
}

// When we have a group of compute processor types, by we default calculate the average for this group of processors.
// However when the group contains either the Sandy Bridge or Ivy Bridge processor type, we calculate the median.
// This is because those processor types are outliers with much higher min/max watts that the other types, so we
// want to take this into account to not over estimate the compute energy in kilowatts.
export function getWattsByAverageOrMedian(
  computeProcessors: string[],
  wattsForProcessors: number[],
): number {
  if (
    computeProcessors.includes(COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE) ||
    computeProcessors.includes(COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE)
  ) {
    return median(wattsForProcessors)
  }
  return getAverage(wattsForProcessors)
}

export function getAverage(nums: number[]): number {
  if (!nums.length) return 0
  if (nums.length === 1) return nums[0]
  return nums.reduce((a, b) => a + b) / nums.length
}

export function estimateCo2(
  estimatedWattHours: number,
  region: string,
  emissionsFactors?: CloudConstantsEmissionsFactors,
): number {
  return estimatedWattHours * emissionsFactors[region]
}
