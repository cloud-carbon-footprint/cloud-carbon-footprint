/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  getAverage,
  getWattsByAverageOrMedian,
  CloudConstantsByProvider,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
  US_NERC_REGIONS_EMISSIONS_FACTORS,
  EstimateClassification,
} from '@cloud-carbon-footprint/core'

import { AZURE_REGIONS } from '../lib/AzureRegions'

export const AZURE_CLOUD_CONSTANTS: CloudConstantsByProvider = {
  SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
  HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
  MEMORY_AVG: 73.68,
  MEMORY_BY_COMPUTE_PROCESSOR: {
    // gigaBytes / physical chip
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 98.12,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 81.32,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 69.65,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 27.71,
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
  MIN_WATTS_AVG: 0.78,
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
  MAX_WATTS_AVG: 3.76,
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
  REPLICATION_FACTORS: {
    STORAGE_LRS: 3,
    STORAGE_ZRS: 3,
    STORAGE_GRS: 6,
    STORAGE_GZRS: 6,
    STORAGE_DISKS: 3,
    DATABASE_MYSQL: 3,
    COSMOS_DB: 4,
    SQL_DB: 3,
    REDIS_CACHE: 2,
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

export const AZURE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: CloudConstantsEmissionsFactors =
  {
    [AZURE_REGIONS.AP_EAST.name]: 0.00081,
    [AZURE_REGIONS.AP_SOUTH_EAST.name]: 0.0004085,
    [AZURE_REGIONS.ASIA.name]: 0.0005647,
    [AZURE_REGIONS.EU_NORTH.name]: 0.000316,
    [AZURE_REGIONS.EU_WEST.name]: 0.00039,
    [AZURE_REGIONS.IN_CENTRAL.name]: 0.000708,
    [AZURE_REGIONS.IN_SOUTH.name]: 0.000708,
    [AZURE_REGIONS.IN_WEST.name]: 0.000708,
    [AZURE_REGIONS.UK_SOUTH.name]: 0.000228,
    [AZURE_REGIONS.UK_WEST.name]: 0.000228,
    [AZURE_REGIONS.US_CENTRAL.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,
    [AZURE_REGIONS.US_EAST.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_2.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_3.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_NORTH_CENTRAL.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.RFC,
    [AZURE_REGIONS.US_SOUTH_CENTRAL.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.TRE,
    [AZURE_REGIONS.US_WEST_CENTRAL.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_2.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_3.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.UNKNOWN.name]: 0.0004074,
  }
