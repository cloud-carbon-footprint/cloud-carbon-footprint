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

import { AWS_REGIONS } from '../lib/AWSRegions'

export const AWS_CLOUD_CONSTANTS: CloudConstantsByProvider = {
  SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
  HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
  MEMORY_AVG: 80.69,
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
    [COMPUTE_PROCESSOR_TYPES.AWS_GRAVITON_2]: 129.78,
  },
  getMemory: (computeProcessors: string[]): number => {
    const memoryForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return AWS_CLOUD_CONSTANTS.MEMORY_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const averageMemoryForProcessors = getAverage(memoryForProcessors)
    return averageMemoryForProcessors
      ? averageMemoryForProcessors
      : AWS_CLOUD_CONSTANTS.MEMORY_AVG
  },
  MIN_WATTS_AVG: 0.74,
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
    [COMPUTE_PROCESSOR_TYPES.AWS_GRAVITON_2]: 0.47,
  },
  getMinWatts: (computeProcessors: string[]): number => {
    const minWattsForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return AWS_CLOUD_CONSTANTS.MIN_WATTS_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const averageWattsForProcessors = getWattsByAverageOrMedian(
      computeProcessors,
      minWattsForProcessors,
    )
    return averageWattsForProcessors
      ? averageWattsForProcessors
      : AWS_CLOUD_CONSTANTS.MIN_WATTS_AVG
  },
  MAX_WATTS_AVG: 3.5,
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
    [COMPUTE_PROCESSOR_TYPES.AWS_GRAVITON_2]: 1.69,
  },
  getMaxWatts: (computeProcessors: string[]): number => {
    const maxWattsForProcessors: number[] = computeProcessors.map(
      (processor: string) => {
        return AWS_CLOUD_CONSTANTS.MAX_WATTS_BY_COMPUTE_PROCESSOR[processor]
      },
    )
    const averageWattsForProcessors = getWattsByAverageOrMedian(
      computeProcessors,
      maxWattsForProcessors,
    )
    return averageWattsForProcessors
      ? averageWattsForProcessors
      : AWS_CLOUD_CONSTANTS.MAX_WATTS_AVG
  },
  NETWORKING_COEFFICIENT: 0.001, // kWh / Gb
  MEMORY_COEFFICIENT: 0.000392, // kWh / Gb
  PUE_AVG: 1.135,
  getPUE: (): number => {
    return AWS_CLOUD_CONSTANTS.PUE_AVG
  },
  AVG_CPU_UTILIZATION_2020: 50,
  REPLICATION_FACTORS: {
    S3: 3,
    S3_ONE_ZONE_REDUCED_REDUNDANCY: 2,
    EC2_EBS_VOLUME: 2,
    EC2_EBS_SNAPSHOT: 3,
    EFS: 3,
    EFS_ONE_ZONE: 2,
    RDS_BACKUP: 3,
    RDS_AURORA: 6,
    RDS_MULTI_AZ: 2,
    DOCUMENT_DB_BACKUP: 3,
    DOCUMENT_DB_STORAGE: 2,
    DYNAMO_DB: 2,
    ECR_STORAGE: 3,
    DOCUMENT_ELASTICACHE_BACKUP: 3,
    SIMPLE_DB: 2,
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
    total: {
      cost: 0,
      co2e: 0,
    },
  },
}

export const AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: CloudConstantsEmissionsFactors =
  {
    [AWS_REGIONS.US_EAST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AWS_REGIONS.US_EAST_2]: US_NERC_REGIONS_EMISSIONS_FACTORS.RFC,
    [AWS_REGIONS.US_WEST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AWS_REGIONS.US_WEST_2]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AWS_REGIONS.US_GOV_EAST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AWS_REGIONS.US_GOV_WEST_1]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AWS_REGIONS.AF_SOUTH_1]: 0.000928,
    [AWS_REGIONS.AP_EAST_1]: 0.00081,
    [AWS_REGIONS.AP_SOUTH_1]: 0.000708,
    [AWS_REGIONS.AP_NORTHEAST_3]: 0.000506,
    [AWS_REGIONS.AP_NORTHEAST_2]: 0.0005,
    [AWS_REGIONS.AP_SOUTHEAST_1]: 0.0004085,
    [AWS_REGIONS.AP_SOUTHEAST_2]: 0.00079,
    [AWS_REGIONS.AP_NORTHEAST_1]: 0.000506,
    [AWS_REGIONS.CA_CENTRAL_1]: 0.00013,
    [AWS_REGIONS.CN_NORTH_1]: 0.000555,
    [AWS_REGIONS.CN_NORTHWEST_1]: 0.000555,
    [AWS_REGIONS.EU_CENTRAL_1]: 0.000338,
    [AWS_REGIONS.EU_WEST_1]: 0.000316,
    [AWS_REGIONS.EU_WEST_2]: 0.000228,
    [AWS_REGIONS.EU_SOUTH_1]: 0.000233,
    [AWS_REGIONS.EU_WEST_3]: 0.000052,
    [AWS_REGIONS.EU_NORTH_1]: 0.000008,
    [AWS_REGIONS.ME_SOUTH_1]: 0.000732,
    [AWS_REGIONS.SA_EAST_1]: 0.000074,
    [AWS_REGIONS.UNKNOWN]: 0.00038738, // Average of the above regions
  }
