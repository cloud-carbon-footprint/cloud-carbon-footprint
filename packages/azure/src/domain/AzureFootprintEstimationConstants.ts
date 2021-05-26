/*
 * © 2021 ThoughtWorks, Inc.
 */
import {
  getAverage,
  getWattsByAverageOrMedian,
  CloudConstantsByProvider,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
} from '@cloud-carbon-footprint/core'

import { AZURE_REGIONS } from '../lib/AzureRegions'

export const AZURE_CLOUD_CONSTANTS: CloudConstantsByProvider = {
  SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
  HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
  MEMORY_AVG: 72.99,
  MEMORY_BY_COMPUTE_PROCESSOR: {
    // gigaBytes / physical chip
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 92.11,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 83.19,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 69.65,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 27.05,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 19.56,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 16.7,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 9.67,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 89.6,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 129.78,
  },
  getMemory: (computeProcessors: string[]): number => {
    const memoryForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return AZURE_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const averageMemoryForProcessors = getAverage(memoryForProcessors)
    return averageMemoryForProcessors
      ? averageMemoryForProcessors
      : AZURE_CLOUD_CONSTANTS.MEMORY_AVG
  },
  MIN_WATTS_AVG: 0.77,
  MIN_WATTS_BY_COMPUTE_PROCESSOR: {
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 0.62,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 0.64,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 0.71,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 1,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 1.14,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 2.17,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 3.04,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 0.82,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 0.47,
  },
  getMinWatts: (computeProcessors: string[]): number => {
    const minWattsForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return AZURE_CLOUD_CONSTANTS.MIN_WATTS_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const averageWattsForProcessors = getWattsByAverageOrMedian(
      computeProcessors,
      minWattsForProcessors,
    )
    return averageWattsForProcessors
      ? averageWattsForProcessors
      : AZURE_CLOUD_CONSTANTS.MIN_WATTS_AVG
  },
  MAX_WATTS_AVG: 3.74,
  MAX_WATTS_BY_COMPUTE_PROCESSOR: {
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 3.94,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 4.15,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 3.68,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 4.74,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 5.42,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 8.58,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 8.25,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 2.55,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 1.69,
  },
  getMaxWatts: (computeProcessors: string[]): number => {
    const maxWattsForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return AZURE_CLOUD_CONSTANTS.MAX_WATTS_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const averageWattsForProcessors = getWattsByAverageOrMedian(
      computeProcessors,
      maxWattsForProcessors,
    )
    return averageWattsForProcessors
      ? averageWattsForProcessors
      : AZURE_CLOUD_CONSTANTS.MAX_WATTS_AVG
  },
  NETWORKING_COEFFICIENT: 0.001, // kWh / Gb
  MEMORY_COEFFICIENT: 0.000392, // kWh / Gb
  PUE_AVG: 1.185,
  getPUE: (): number => {
    return AZURE_CLOUD_CONSTANTS.PUE_AVG
  },
  AVG_CPU_UTILIZATION_2020: 50,
}

const US_NERC_REGIONS_EMISSIONS_FACTORS: { [nercRegion: string]: number } = {
  RFC: 0.000440187,
  SERC: 0.000415755,
  WECC: 0.000350861,
  MRO: 0.00047223,
  TRE: 0.000396293,
}

export const AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: CloudConstantsEmissionsFactors =
  {
    [AZURE_REGIONS.AP_EAST]: 0.00081,
    [AZURE_REGIONS.AP_SOUTH_EAST]: 0.0004085,
    [AZURE_REGIONS.ASIA]: 0.0005647,
    [AZURE_REGIONS.EU_NORTH]: 0.000316,
    [AZURE_REGIONS.EU_WEST]: 0.00039,
    [AZURE_REGIONS.IN_CENTRAL]: 0.000708,
    [AZURE_REGIONS.IN_SOUTH]: 0.000708,
    [AZURE_REGIONS.IN_WEST]: 0.000708,
    [AZURE_REGIONS.UK_SOUTH]: 0.000228,
    [AZURE_REGIONS.UK_WEST]: 0.000228,
    [AZURE_REGIONS.US_CENTRAL]: US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,
    [AZURE_REGIONS.US_EAST]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_2]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_3]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_NORTH_CENTRAL]: US_NERC_REGIONS_EMISSIONS_FACTORS.RFC,
    [AZURE_REGIONS.US_SOUTH_CENTRAL]: US_NERC_REGIONS_EMISSIONS_FACTORS.TRE,
    [AZURE_REGIONS.US_WEST_CENTRAL]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_2]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_3]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.UNKNOWN]: 0.0004074,
  }
