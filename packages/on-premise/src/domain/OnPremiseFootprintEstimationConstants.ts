/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  getAverage,
  getWattsByAverageOrMedian,
  CloudConstantsByProvider,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
} from '@cloud-carbon-footprint/core'

export const ON_PREMISE_CLOUD_CONSTANTS: CloudConstantsByProvider = {
  MEMORY_AVG: 331.7121348,
  MEMORY_BY_COMPUTE_PROCESSOR: {
    // gigaBytes
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 797.971831,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 745.1358025,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 764.2352941,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 80.38095238,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 19.55555556,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 65.952,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 45.33333333,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 166.4,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 300.4444444,
  },
  getMemory: (computeProcessors: string[]): number => {
    const memoryForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return ON_PREMISE_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const averageMemoryForProcessors = getAverage(memoryForProcessors)
    return averageMemoryForProcessors
      ? averageMemoryForProcessors
      : ON_PREMISE_CLOUD_CONSTANTS.MEMORY_AVG
  },
  MIN_WATTS_AVG: 65.81111111,
  MIN_WATTS_BY_COMPUTE_PROCESSOR: {
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 120,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 88.9,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 46.6,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 46.9,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 15.9,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 57.5,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 41.5,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 91.6,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 83.4,
  },
  getMinWatts: (computeProcessors: string[]): number => {
    const minWattsForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return ON_PREMISE_CLOUD_CONSTANTS.MIN_WATTS_BY_COMPUTE_PROCESSOR[
          processor
        ]
      },
    )
    const averageWattsForProcessors = getWattsByAverageOrMedian(
      computeProcessors,
      minWattsForProcessors,
    )
    return averageWattsForProcessors
      ? averageWattsForProcessors
      : ON_PREMISE_CLOUD_CONSTANTS.MIN_WATTS_AVG
  },
  MAX_WATTS_AVG: 367.1444444,
  MAX_WATTS_BY_COMPUTE_PROCESSOR: {
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 919,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 733,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 272,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 272,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 71.7,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 257,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 89.6,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 295.5,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 394.5,
  },
  getMaxWatts: (computeProcessors: string[]): number => {
    const maxWattsForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return ON_PREMISE_CLOUD_CONSTANTS.MAX_WATTS_BY_COMPUTE_PROCESSOR[
          processor
        ]
      },
    )
    const averageWattsForProcessors = getWattsByAverageOrMedian(
      computeProcessors,
      maxWattsForProcessors,
    )
    return averageWattsForProcessors
      ? averageWattsForProcessors
      : ON_PREMISE_CLOUD_CONSTANTS.MAX_WATTS_AVG
  },
  MEMORY_COEFFICIENT: 0.000392, // kWh / Gb
  PUE_AVG: 1.58,
  getPUE: (): number => {
    return ON_PREMISE_CLOUD_CONSTANTS.PUE_AVG
  },
  AVG_CPU_UTILIZATION_2020: 50,
}

export const ON_PREMISE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: CloudConstantsEmissionsFactors =
  {
    Australia: 0.00096,
    Canada: 0.0000186,
    Finland: 0.00009532,
    France: 0.00005128,
    Germany: 0.00033866,
    India: 0.0007082,
    Ireland: 0.00033599,
    Israel: 0.00046095,
    Italy: 0.00032384,
    Malaysia: 0.000408,
    Poland: 0.00075962,
    Romania: 0.00026184,
    'South Korea': 0.0004156,
    Spain: 0.00017103,
    Sweden: 0.00000567,
    Switzerland: 0.00001152,
    'United Kingdom': 0.00021233,
    'United States': 0.00042394,
    // values specific for US states are sourced from NERC regional emissions factors
    'United States-California': 0.00017562,
    'United States-Virginia': 0.00028842,
    'United States-Louisiana': 0.00037481,
    'United States-Florida': 0.00039793,
    'United States-Illinois': 0.00032921,
    'United States-Texas': 0.00041432,
    'United States-Washington': 0.00013567,
    'United States-Ohio': 0.00056357,
    'United States-Oregon': 0.00017562,
    Unknown: 0.0003228315385, // average
  }
