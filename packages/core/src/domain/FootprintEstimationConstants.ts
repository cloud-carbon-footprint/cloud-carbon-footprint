/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { AWS_REGIONS } from '../services/aws/AWSRegions'
import { GCP_REGIONS } from '../services/gcp/GCPRegions'
import { AZURE_REGIONS } from '../services/azure/AzureRegions'
import { COMPUTE_PROCESSOR_TYPES } from './ComputeProcessorTypes'

type CloudConstantsByProvider = {
  SSDCOEFFICIENT: number
  HDDCOEFFICIENT: number
  MIN_WATTS_AVG: number
  MIN_WATTS_BY_COMPUTE_PROCESSOR: { [key: string]: number }
  getMinWatts: (computeProcessors?: string[]) => number
  MAX_WATTS_AVG: number
  MAX_WATTS_BY_COMPUTE_PROCESSOR: { [key: string]: number }
  getMaxWatts: (computeProcessors?: string[]) => number
  PUE_AVG: number
  NETWORKING_COEFFICIENT: number
  PUE_TRAILING_TWELVE_MONTH?: { [key: string]: number }
  getPUE: (region?: string) => number
  AVG_CPU_UTILIZATION_2020: number
}

type CloudConstants = {
  [cloudProvider: string]: CloudConstantsByProvider
}

// the cloud constants are very repetitive for each cloud provider
// this was to simplify any preferential changes to coefficients per provider
export const CLOUD_CONSTANTS: CloudConstants = {
  GCP: {
    SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
    HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
    MIN_WATTS_AVG: 0.58,
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
          return CLOUD_CONSTANTS.GCP.MIN_WATTS_BY_COMPUTE_PROCESSOR[processor]
        },
      )
      const averageWattsForProcessors = getAverage(minWattsForProcessors)
      return averageWattsForProcessors
        ? averageWattsForProcessors
        : CLOUD_CONSTANTS.GCP.MIN_WATTS_AVG
    },
    MAX_WATTS_AVG: 3.54,
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
          return CLOUD_CONSTANTS.GCP.MAX_WATTS_BY_COMPUTE_PROCESSOR[processor]
        },
      )
      const averageWattsForProcessors = getAverage(maxWattsForProcessors)
      return averageWattsForProcessors
        ? averageWattsForProcessors
        : CLOUD_CONSTANTS.GCP.MAX_WATTS_AVG
    },
    NETWORKING_COEFFICIENT: 0.001, // kWh / Gb
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
      return CLOUD_CONSTANTS.GCP.PUE_TRAILING_TWELVE_MONTH[region]
        ? CLOUD_CONSTANTS.GCP.PUE_TRAILING_TWELVE_MONTH[region]
        : CLOUD_CONSTANTS.GCP.PUE_AVG
    },
    AVG_CPU_UTILIZATION_2020: 50,
  },
  AWS: {
    SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
    HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
    MIN_WATTS_AVG: 0.59,
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
          return CLOUD_CONSTANTS.AWS.MIN_WATTS_BY_COMPUTE_PROCESSOR[processor]
        },
      )
      const averageWattsForProcessors = getAverage(minWattsForProcessors)
      return averageWattsForProcessors
        ? averageWattsForProcessors
        : CLOUD_CONSTANTS.AWS.MIN_WATTS_AVG
    },
    MAX_WATTS_AVG: 3.5,
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
          return CLOUD_CONSTANTS.AWS.MAX_WATTS_BY_COMPUTE_PROCESSOR[processor]
        },
      )
      const averageWattsForProcessors = getAverage(maxWattsForProcessors)
      return averageWattsForProcessors
        ? averageWattsForProcessors
        : CLOUD_CONSTANTS.AWS.MAX_WATTS_AVG
    },
    NETWORKING_COEFFICIENT: 0.001, // kWh / Gb
    PUE_AVG: 1.135,
    getPUE: (): number => {
      return CLOUD_CONSTANTS.AWS.PUE_AVG
    },
    AVG_CPU_UTILIZATION_2020: 50,
  },
  AZURE: {
    SSDCOEFFICIENT: 1.2, // watt hours / terabyte hour
    HDDCOEFFICIENT: 0.65, // watt hours / terabyte hour
    MIN_WATTS_AVG: 0.59,
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
          return CLOUD_CONSTANTS.AZURE.MIN_WATTS_BY_COMPUTE_PROCESSOR[processor]
        },
      )
      const averageWattsForProcessors = getAverage(minWattsForProcessors)
      return averageWattsForProcessors
        ? averageWattsForProcessors
        : CLOUD_CONSTANTS.AZURE.MIN_WATTS_AVG
    },
    MAX_WATTS_AVG: 3.5,
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
          return CLOUD_CONSTANTS.AZURE.MAX_WATTS_BY_COMPUTE_PROCESSOR[processor]
        },
      )
      const averageWattsForProcessors = getAverage(maxWattsForProcessors)
      return averageWattsForProcessors
        ? averageWattsForProcessors
        : CLOUD_CONSTANTS.AZURE.MAX_WATTS_AVG
    },
    NETWORKING_COEFFICIENT: 0.001, // kWh / Gb
    PUE_AVG: 1.125,
    getPUE: (): number => {
      return CLOUD_CONSTANTS.AZURE.PUE_AVG
    },
    AVG_CPU_UTILIZATION_2020: 50,
  },
}

const US_NERC_REGIONS_EMISSIONS_FACTORS: { [nercRegion: string]: number } = {
  RFC: 0.000475105,
  SERC: 0.0004545,
  WECC: 0.000351533,
  MRO: 0.000540461,
  TRE: 0.000424877,
}

export const CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH: {
  [cloudProvider: string]: { [region: string]: number }
} = {
  AWS: {
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
  },
  GCP: {
    [GCP_REGIONS.US_CENTRAL1]: 0.000479,
    [GCP_REGIONS.US_CENTRAL2]: 0.000479,
    [GCP_REGIONS.US_EAST1]: 0.0005,
    [GCP_REGIONS.US_EAST4]: 0.000383,
    [GCP_REGIONS.US_WEST1]: 0.000117,
    [GCP_REGIONS.US_WEST2]: 0.000248,
    [GCP_REGIONS.US_WEST3]: 0.000561,
    [GCP_REGIONS.US_WEST4]: 0.000491,
    [GCP_REGIONS.ASIA_EAST1]: 0.000541,
    [GCP_REGIONS.ASIA_EAST2]: 0.000626,
    [GCP_REGIONS.ASIA_NORTHEAST1]: 0.000524,
    [GCP_REGIONS.ASIA_NORTHEAST2]: 0.000524,
    [GCP_REGIONS.ASIA_NORTHEAST3]: 0.00054,
    [GCP_REGIONS.ASIA_SOUTH1]: 0.000723,
    [GCP_REGIONS.ASIA_SOUTHEAST1]: 0.000493,
    [GCP_REGIONS.ASIA_SOUTHEAST2]: 0.000772,
    [GCP_REGIONS.AUSTRALIA_SOUTHEAST1]: 0.000725,
    [GCP_REGIONS.EUROPE_NORTH1]: 0.000181,
    [GCP_REGIONS.EUROPE_WEST1]: 0.000196,
    [GCP_REGIONS.EUROPE_WEST2]: 0.000257,
    [GCP_REGIONS.EUROPE_WEST3]: 0.000319,
    [GCP_REGIONS.EUROPE_WEST4]: 0.000474,
    [GCP_REGIONS.EUROPE_WEST6]: 0.000029,
    [GCP_REGIONS.NORTHAMERICA_NORTHEAST1]: 0.000143,
    [GCP_REGIONS.SOUTHAMERICA_EAST1]: 0.000109,
    [GCP_REGIONS.UNKNOWN]: 0.0004108907, // Average of the above regions
  },
  AZURE: {
    [AZURE_REGIONS.AP_EAST]: 0.00081,
    [AZURE_REGIONS.EU_WEST]: 0.00039,
    [AZURE_REGIONS.IN_CENTRAL]: 0.000708,
    [AZURE_REGIONS.UK_SOUTH]: 0.000228,
    [AZURE_REGIONS.UK_WEST]: 0.000228,
    [AZURE_REGIONS.US_CENTRAL]: US_NERC_REGIONS_EMISSIONS_FACTORS.MRO,
    [AZURE_REGIONS.US_EAST]: US_NERC_REGIONS_EMISSIONS_FACTORS.SERC,
    [AZURE_REGIONS.US_SOUTH_CENTRAL]: US_NERC_REGIONS_EMISSIONS_FACTORS.TRE,
    [AZURE_REGIONS.US_WEST]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.US_WEST_2]: US_NERC_REGIONS_EMISSIONS_FACTORS.WECC,
    [AZURE_REGIONS.UNKNOWN]: 0.0004074,
  },
}

function getAverage(nums: number[]): number {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b) / nums.length
}

export function estimateCo2(
  estimatedWattHours: number,
  cloudProvider: string,
  region: string,
): number {
  return (
    estimatedWattHours *
    CLOUD_PROVIDER_EMISSIONS_FACTORS_METRIC_TON_PER_KWH[cloudProvider][region]
  )
}
