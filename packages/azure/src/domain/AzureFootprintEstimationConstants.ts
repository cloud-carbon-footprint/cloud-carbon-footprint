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
  EstimateUnknownUsageBy,
} from '@cloud-carbon-footprint/core'

import { AZURE_REGIONS } from '../lib/AzureRegions'

export const AZURE_CLOUD_CONSTANTS: CloudConstantsByProvider = {
  SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
  HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
  MEMORY_AVG: 80.47,
  MEMORY_BY_COMPUTE_PROCESSOR: {
    // gigaBytes / physical chip
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name]:
      COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE.name]:
      COMPUTE_PROCESSOR_TYPES.SKYLAKE.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL.name]:
      COMPUTE_PROCESSOR_TYPES.BROADWELL.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.HASWELL.name]:
      COMPUTE_PROCESSOR_TYPES.HASWELL.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE.name]:
      COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE.name]:
      COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE.name]:
      COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN.gb_chip_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN.gb_chip_avg,
  },
  getMemory: (computeProcessors: string[]): number => {
    // If certain processors are specified, return their value(s), Otherwise
    // e.g. in the case of "Unknown" instance types, return the average of all
    // processors used by the provider
    let memoryForProcessors: number[] = []

    if (!computeProcessors.length || computeProcessors[0] == 'Unknown') {
      for (const processor in AZURE_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR) {
        memoryForProcessors.push(
          AZURE_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR[processor],
        )
      }
    } else {
      memoryForProcessors = computeProcessors.map((processor: string) => {
        return AZURE_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR[processor]
      })
    }

    return getAverage(memoryForProcessors)
  },
  MIN_WATTS_AVG: 0.74,
  MIN_WATTS_BY_COMPUTE_PROCESSOR: {
    // CPUs
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name]:
      COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE.name]:
      COMPUTE_PROCESSOR_TYPES.SKYLAKE.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL.name]:
      COMPUTE_PROCESSOR_TYPES.BROADWELL.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.HASWELL.name]:
      COMPUTE_PROCESSOR_TYPES.HASWELL.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE.name]:
      COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE.name]:
      COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE.name]:
      COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN.min_watts_avg,
    // GPUs
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_T4.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_T4.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P40.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P40.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100.min_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.XILINX_ALVEO_U250.name]:
      COMPUTE_PROCESSOR_TYPES.XILINX_ALVEO_U250.min_watts_avg,
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
  MAX_WATTS_AVG: 3.54,
  MAX_WATTS_BY_COMPUTE_PROCESSOR: {
    // CPUs
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.name]:
      COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE.name]:
      COMPUTE_PROCESSOR_TYPES.SKYLAKE.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL.name]:
      COMPUTE_PROCESSOR_TYPES.BROADWELL.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.HASWELL.name]:
      COMPUTE_PROCESSOR_TYPES.HASWELL.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE.name]:
      COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE.name]:
      COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE.name]:
      COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN.name]:
      COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN.max_watts_avg,
    // GPUs
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_T4.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_T4.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P40.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P40.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100.name]:
      COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100.max_watts_avg,
    [COMPUTE_PROCESSOR_TYPES.XILINX_ALVEO_U250.name]:
      COMPUTE_PROCESSOR_TYPES.XILINX_ALVEO_U250.max_watts_avg,
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
    DEFAULT: 1,
  },
  // these constants accumulate as the usage rows are mapped over
  KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT: {
    total: {},
  },
  ESTIMATE_UNKNOWN_USAGE_BY: EstimateUnknownUsageBy.USAGE_AMOUNT,
  SERVER_EXPECTED_LIFESPAN: 35040, // 4 years in hours
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
