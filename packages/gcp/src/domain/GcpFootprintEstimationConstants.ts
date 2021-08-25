/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  getWattsByAverageOrMedian,
  CloudConstantsByProvider,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
  EstimateClassification,
} from '@cloud-carbon-footprint/core'

import {
  GCP_REGIONS,
  GCP_DUAL_REGIONS,
  GCP_MULTI_REGIONS,
} from '../lib/GCPRegions'

export const GCP_CLOUD_CONSTANTS: CloudConstantsByProvider = {
  SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
  HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
  MIN_WATTS_MEDIAN: 0.71,
  MIN_WATTS_BY_COMPUTE_PROCESSOR: {
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 0.64,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 0.65,
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
        return GCP_CLOUD_CONSTANTS.MIN_WATTS_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const wattsForProcessors: number = getWattsByAverageOrMedian(
      computeProcessors,
      minWattsForProcessors,
    )
    return wattsForProcessors
      ? wattsForProcessors
      : GCP_CLOUD_CONSTANTS.MIN_WATTS_MEDIAN
  },
  MAX_WATTS_MEDIAN: 4.26,
  MAX_WATTS_BY_COMPUTE_PROCESSOR: {
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 3.97,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 4.26,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 3.69,
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
        return GCP_CLOUD_CONSTANTS.MAX_WATTS_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const wattsForProcessors: number = getWattsByAverageOrMedian(
      computeProcessors,
      maxWattsForProcessors,
    )

    return wattsForProcessors
      ? wattsForProcessors
      : GCP_CLOUD_CONSTANTS.MAX_WATTS_MEDIAN
  },
  NETWORKING_COEFFICIENT: 0.001, // kWh / Gb
  MEMORY_COEFFICIENT: 0.000392, // kWh / Gb
  PUE_AVG: 1.1,
  PUE_TRAILING_TWELVE_MONTH: {
    [GCP_REGIONS.US_EAST1]: 1.102,
    [GCP_REGIONS.US_CENTRAL1]: 1.11,
    [GCP_REGIONS.US_CENTRAL2]: 1.12,
    [GCP_REGIONS.US_WEST1]: 1.095,
    [GCP_REGIONS.EUROPE_WEST1]: 1.08,
    [GCP_REGIONS.EUROPE_WEST4]: 1.09,
    [GCP_REGIONS.EUROPE_NORTH1]: 1.09,
    [GCP_REGIONS.ASIA_EAST1]: 1.13,
    [GCP_REGIONS.ASIA_SOUTHEAST1]: 1.14,
    [GCP_REGIONS.SOUTHAMERICA_EAST1]: 1.09,
  },
  getPUE: (region: string): number => {
    return GCP_CLOUD_CONSTANTS.PUE_TRAILING_TWELVE_MONTH[region]
      ? GCP_CLOUD_CONSTANTS.PUE_TRAILING_TWELVE_MONTH[region]
      : GCP_CLOUD_CONSTANTS.PUE_AVG
  },
  AVG_CPU_UTILIZATION_2020: 50,
  REPLICATION_FACTORS: {
    CLOUD_STORAGE_SINGLE_REGION: 2,
    CLOUD_STORAGE_DUAL_REGION: 4,
    CLOUD_STORAGE_MULTI_REGION: 6,
    COMPUTE_ENGINE_REGIONAL_DISKS: 2,
    CLOUD_FILESTORE: 2,
    CLOUD_SQL_HIGH_AVAILABILITY: 2,
    CLOUD_MEMORY_STORE_REDIS: 2,
  },
  // these constants accumulate as the usage rows are mapped over
  CO2E_PER_COST: {
    [EstimateClassification.COMPUTE]: {
      cost: 0,
      co2e: 0,
    },
    [EstimateClassification.STORAGE]: {
      cost: 0,
      co2e: 0,
    },
    [EstimateClassification.NETWORKING]: {
      cost: 0,
      co2e: 0,
    },
    [EstimateClassification.MEMORY]: {
      cost: 0,
      co2e: 0,
    },
    total: {
      cost: 0,
      co2e: 0,
    },
  },
}

export const GCP_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: CloudConstantsEmissionsFactors =
  {
    [GCP_REGIONS.US_CENTRAL1]: 0.000454,
    [GCP_REGIONS.US_CENTRAL2]: 0.000454,
    [GCP_REGIONS.US_EAST1]: 0.00048,
    [GCP_REGIONS.US_EAST4]: 0.000361,
    [GCP_REGIONS.US_WEST1]: 0.000078,
    [GCP_REGIONS.US_WEST2]: 0.000253,
    [GCP_REGIONS.US_WEST3]: 0.000533,
    [GCP_REGIONS.US_WEST4]: 0.000455,
    [GCP_REGIONS.ASIA_EAST1]: 0.00054,
    [GCP_REGIONS.ASIA_EAST2]: 0.000453,
    [GCP_REGIONS.ASIA_NORTHEAST1]: 0.000554,
    [GCP_REGIONS.ASIA_NORTHEAST2]: 0.000442,
    [GCP_REGIONS.ASIA_NORTHEAST3]: 0.000457,
    [GCP_REGIONS.ASIA_SOUTH1]: 0.000721,
    [GCP_REGIONS.ASIA_SOUTH2]: 0.000657,
    [GCP_REGIONS.ASIA_SOUTHEAST1]: 0.000493,
    [GCP_REGIONS.ASIA_SOUTHEAST2]: 0.000647,
    [GCP_REGIONS.AUSTRALIA_SOUTHEAST1]: 0.000727,
    [GCP_REGIONS.AUSTRALIA_SOUTHEAST2]: 0.000691,
    [GCP_REGIONS.EUROPE_CENTRAL2]: 0.000622,
    [GCP_REGIONS.EUROPE_NORTH1]: 0.000133,
    [GCP_REGIONS.EUROPE_WEST1]: 0.000212,
    [GCP_REGIONS.EUROPE_WEST2]: 0.000231,
    [GCP_REGIONS.EUROPE_WEST3]: 0.000293,
    [GCP_REGIONS.EUROPE_WEST4]: 0.00041,
    [GCP_REGIONS.EUROPE_WEST6]: 0.000087,
    [GCP_REGIONS.NORTHAMERICA_NORTHEAST1]: 0.000027,
    [GCP_REGIONS.SOUTHAMERICA_EAST1]: 0.000103,
    [GCP_DUAL_REGIONS.ASIA1]: 0.000498,
    [GCP_DUAL_REGIONS.EUR4]: 0.0002715,
    [GCP_DUAL_REGIONS.NAM4]: 0.000467,
    [GCP_MULTI_REGIONS.ASIA]: 0.0005515555556,
    [GCP_MULTI_REGIONS.EU]: 0.000284,
    [GCP_MULTI_REGIONS.US]: 0.0003734285714,
    [GCP_REGIONS.UNKNOWN]: 0.0004116296296, // Average of the above regions
  }
