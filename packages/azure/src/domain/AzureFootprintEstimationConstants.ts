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
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 98.12,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 81.32,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 69.65,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 27.71,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 19.56,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 16.7,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 9.67,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 89.6,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 129.78,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN]: 128.0,
  },
  getMemory: (computeProcessors: string[]): number => {
    const memoryForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return AZURE_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR
          ? AZURE_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR[processor]
          : 0
      },
    )
    const averageMemoryForProcessors = getAverage(memoryForProcessors)
    return averageMemoryForProcessors
      ? averageMemoryForProcessors
      : AZURE_CLOUD_CONSTANTS.MEMORY_AVG || 0
  },
  MIN_WATTS_AVG: 0.74,
  MIN_WATTS_BY_COMPUTE_PROCESSOR: {
    // CPUs
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 0.64,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 0.65,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 0.71,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 1,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 1.14,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 2.17,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 3.04,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 0.82,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 0.47,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN]: 0.45,
    // GPUs
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_T4]: 8,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80]: 35,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100]: 36,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100]: 35,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60]: 35,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P40]: 30,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100]: 46,
    [COMPUTE_PROCESSOR_TYPES.XILINX_ALVEO_U250]: 27,
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
      : AZURE_CLOUD_CONSTANTS.MIN_WATTS_AVG || 0
  },
  MAX_WATTS_AVG: 3.54,
  MAX_WATTS_BY_COMPUTE_PROCESSOR: {
    // CPUs
    [COMPUTE_PROCESSOR_TYPES.CASCADE_LAKE]: 3.97,
    [COMPUTE_PROCESSOR_TYPES.SKYLAKE]: 4.26,
    [COMPUTE_PROCESSOR_TYPES.BROADWELL]: 3.69,
    [COMPUTE_PROCESSOR_TYPES.HASWELL]: 4.74,
    [COMPUTE_PROCESSOR_TYPES.COFFEE_LAKE]: 5.42,
    [COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE]: 8.58,
    [COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE]: 8.25,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_1ST_GEN]: 2.55,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_2ND_GEN]: 1.69,
    [COMPUTE_PROCESSOR_TYPES.AMD_EPYC_3RD_GEN]: 2.02,
    // GPUs
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_T4]: 71,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_K80]: 306,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P100]: 306,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_V100]: 306,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_M60]: 306,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_P40]: 255,
    [COMPUTE_PROCESSOR_TYPES.NVIDIA_TESLA_A100]: 407,
    [COMPUTE_PROCESSOR_TYPES.XILINX_ALVEO_U250]: 229.5,
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
      : AZURE_CLOUD_CONSTANTS.MAX_WATTS_AVG || 0
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
    // Africa regions
    [AZURE_REGIONS.AF_SOUTH_AFRICA.name]: 0.0009006,
    [AZURE_REGIONS.AF_SOUTH_AFRICA_NORTH.name]: 0.0009006,
    [AZURE_REGIONS.AF_SOUTH_AFRICA_WEST.name]: 0.0009006,

    // APAC regions
    [AZURE_REGIONS.AP_AUSTRALIA.name]: 0.00079,
    [AZURE_REGIONS.AP_AUSTRALIA_CENTRAL.name]: 0.00079,
    [AZURE_REGIONS.AP_AUSTRALIA_CENTRAL2.name]: 0.00079,
    [AZURE_REGIONS.AP_AUSTRALIA_EAST.name]: 0.00079,
    [AZURE_REGIONS.AP_AUSTRALIA_SOUTH_EAST.name]: 0.00096,

    [AZURE_REGIONS.AP_EAST.name]: 0.00071,
    [AZURE_REGIONS.AP_SOUTH_EAST.name]: 0.000408,

    [AZURE_REGIONS.AP_JAPAN_EAST.name]: 0.0004658,
    [AZURE_REGIONS.AP_JAPAN_WEST.name]: 0.0004658,
    [AZURE_REGIONS.AP_JAPAN.name]: 0.0004658,

    [AZURE_REGIONS.AP_KOREA.name]: 0.0004156,
    [AZURE_REGIONS.AP_KOREA_EAST.name]: 0.0004156,
    [AZURE_REGIONS.AP_KOREA_SOUTH.name]: 0.0004156,

    [AZURE_REGIONS.ASIA.name]: 0.0005647,
    [AZURE_REGIONS.ASIA_PACIFIC.name]: 0.0005647,
    [AZURE_REGIONS.ASIA_EAST.name]: 0.00071,
    [AZURE_REGIONS.ASIA_EAST_STAGE.name]: 0.00071,
    [AZURE_REGIONS.ASIA_SOUTH_EAST.name]: 0.000408,
    [AZURE_REGIONS.ASIA_SOUTH_EAST_STAGE.name]: 0.000408,

    [AZURE_REGIONS.INDIA.name]: 0.0007082,
    [AZURE_REGIONS.IN_CENTRAL.name]: 0.0007082,
    [AZURE_REGIONS.IN_JIO_CENTRAL.name]: 0.0007082,
    [AZURE_REGIONS.IN_JIO_WEST.name]: 0.0007082,
    [AZURE_REGIONS.IN_SOUTH.name]: 0.0007082,
    [AZURE_REGIONS.IN_WEST.name]: 0.0007082,

    // EU regions
    [AZURE_REGIONS.EU_NORTH.name]: 0.0002786,
    [AZURE_REGIONS.EU_WEST.name]: 0.0003284,

    [AZURE_REGIONS.EU_FRANCE_CENTRAL.name]: 0.00005128,
    [AZURE_REGIONS.EU_FRANCE_SOUTH.name]: 0.00005128,
    [AZURE_REGIONS.EU_FRANCE.name]: 0.00005128,

    [AZURE_REGIONS.EU_SWEDEN_CENTRAL.name]: 0.00000567,

    [AZURE_REGIONS.EU_SWITZERLAND.name]: 0.00001152,
    [AZURE_REGIONS.EU_SWITZERLAND_NORTH.name]: 0.00001152,
    [AZURE_REGIONS.EU_SWITZERLAND_WEST.name]: 0.00001152,

    [AZURE_REGIONS.UK_SOUTH.name]: 0.000225,
    [AZURE_REGIONS.UK_WEST.name]: 0.000225,
    [AZURE_REGIONS.EU_UK.name]: 0.000225,

    [AZURE_REGIONS.EU_GERMANY.name]: 0.00033866,
    [AZURE_REGIONS.EU_GERMANY_NORTH.name]: 0.00033866,
    [AZURE_REGIONS.EU_GERMANY_WESTCENTRAL.name]: 0.00033866,
    [AZURE_REGIONS.EU_NORWAY.name]: 0.00000762,
    [AZURE_REGIONS.EU_NORWAY_EAST.name]: 0.00000762,
    [AZURE_REGIONS.EU_NORWAY_WEST.name]: 0.00000762,

    // Middle east regions
    [AZURE_REGIONS.ME_UAE.name]: 0.0004041,
    [AZURE_REGIONS.ME_UAE_CENTRAL.name]: 0.0004041,
    [AZURE_REGIONS.ME_UAE_NORTH.name]: 0.0004041,

    // Americas regions
    [AZURE_REGIONS.US_CANADA.name]: 0.00012,
    [AZURE_REGIONS.US_CANADA_CENTRAL.name]: 0.00012,
    [AZURE_REGIONS.US_CANADA_EAST.name]: 0.00012,

    [AZURE_REGIONS.US_CENTRAL.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,
    [AZURE_REGIONS.US_CENTRAL_EUAP.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,
    [AZURE_REGIONS.US_CENTRAL_STAGE.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,
    [AZURE_REGIONS.US_US.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,
    [AZURE_REGIONS.US_US_EAP.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,

    [AZURE_REGIONS.US_EAST.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_STAGE.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_2.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_2_EUAP.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_2_STAGE.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_EAST_3.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,

    [AZURE_REGIONS.US_NORTH.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.RFC,
    [AZURE_REGIONS.US_NORTH_CENTRAL.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.RFC,
    [AZURE_REGIONS.US_NORTH_CENTRAL_STAGE.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.RFC,

    [AZURE_REGIONS.US_SOUTH_CENTRAL.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.TRE,
    [AZURE_REGIONS.US_SOUTH_CENTRAL_STAGE.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.TRE,

    [AZURE_REGIONS.US_WEST_CENTRAL.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_STAGE.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_2.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_2_STAGE.name]:
      US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_3.name]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,

    [AZURE_REGIONS.BRAZIL.name]: 0.0000617,
    [AZURE_REGIONS.BRAZIL_SOUTH.name]: 0.0000617,
    [AZURE_REGIONS.BRAZIL_SOUTH_EAST.name]: 0.0000617,

    [AZURE_REGIONS.UNKNOWN.name]: 0.0003512799615, // Average of above regions
  }
