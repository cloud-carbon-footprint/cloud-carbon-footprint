/*
 * © 2021 Thoughtworks, Inc.
 */

import { Co2ePerCost } from './FootprintEstimate'

export default interface CloudConstants {
  readonly minWatts?: number
  readonly maxWatts?: number
  readonly powerUsageEffectiveness?: number
  readonly avgCpuUtilization?: number
  readonly replicationFactor?: number
  readonly co2ePerCost?: Co2ePerCost
}

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
  REPLICATION_FACTORS?: { [key: string]: number }
  CO2E_PER_COST?: Co2ePerCost
}

export type CloudConstantsEmissionsFactors = {
  [region: string]: number
}

export type ReplicationFactorsForService = {
  [key: string]: (usageType?: string, region?: string) => number
}
