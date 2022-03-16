/*
 * © 2021 Thoughtworks, Inc.
 */

import { KilowattHoursByServiceAndUsageUnit } from './FootprintEstimate'
import { EstimateUnknownUsageBy } from './unknown'

export default interface CloudConstants {
  readonly minWatts?: number
  readonly maxWatts?: number
  readonly powerUsageEffectiveness?: number
  readonly avgCpuUtilization?: number
  readonly replicationFactor?: number
  readonly kilowattHoursByServiceAndUsageUnit?: KilowattHoursByServiceAndUsageUnit
  readonly averageWatts?: number
}

export type CloudConstantsByProvider = {
  SSDCOEFFICIENT?: number
  HDDCOEFFICIENT?: number
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
  NETWORKING_COEFFICIENT?: number
  MEMORY_COEFFICIENT?: number
  PUE_TRAILING_TWELVE_MONTH?: { [key: string]: number }
  getPUE: (region?: string) => number
  AVG_CPU_UTILIZATION_2020: number
  REPLICATION_FACTORS?: { [key: string]: number }
  KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT?: KilowattHoursByServiceAndUsageUnit
  ESTIMATE_UNKNOWN_USAGE_BY?: EstimateUnknownUsageBy
  SERVER_EXPECTED_LIFESPAN?: number
}

export type CloudConstantsEmissionsFactors = {
  [region: string]: number
}

export type ReplicationFactorsForService = {
  [key: string]: (usageType?: string, region?: string) => number
}
