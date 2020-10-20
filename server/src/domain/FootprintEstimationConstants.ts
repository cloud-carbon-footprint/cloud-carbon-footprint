import { AWS_REGIONS } from '@services/aws/AWSRegions'
import { GCP_REGIONS } from '@services/gcp/GCPRegions'

// We are using AWS values for now until we have values for GCP
export const CLOUD_CONSTANTS: { [cloudProvider: string]: { [constantName: string]: number } } = {
  GCP: {
    SSDCOEFFICIENT: 1.2,
    HDDCOEFFICIENT: 0.67,
    MIN_WATTS: 0.61,
    MAX_WATTS: 3.15,
    POWER_USAGE_EFFECTIVENESS: 1.2,
    AVG_CPU_UTILIZATION_2020: 50,
  },
  AWS: {
    SSDCOEFFICIENT: 1.2,
    HDDCOEFFICIENT: 0.67,
    MIN_WATTS: 0.61,
    MAX_WATTS: 3.15,
    POWER_USAGE_EFFECTIVENESS: 1.2,
    AVG_CPU_UTILIZATION_2020: 50,
  },
}

export const CLOUD_PROVIDER_WATT_HOURS_CARBON_RATIOS: { [cloudProvider: string]: { [region: string]: number } } = {
  AWS: {
    [AWS_REGIONS.US_EAST_1]: 0.0003369284124,
    [AWS_REGIONS.US_EAST_2]: 0.0006031871336,
    [AWS_REGIONS.US_WEST_1]: 0.0001914159801,
    [AWS_REGIONS.US_WEST_2]: 0.0001425187227,
    [AWS_REGIONS.AF_SOUTH_1]: 0.0004322281694,
    [AWS_REGIONS.AP_EAST_1]: 0.000928,
    [AWS_REGIONS.AP_SOUTH_1]: 0.00081,
    [AWS_REGIONS.AP_NORTHEAST_3]: 0.000708,
    [AWS_REGIONS.AP_NORTHEAST_2]: 0.000506,
    [AWS_REGIONS.AP_SOUTHEAST_1]: 0.0005,
    [AWS_REGIONS.AP_SOUTHEAST_2]: 0.0004188,
    [AWS_REGIONS.AP_NORTHEAST_1]: 0.00079,
    [AWS_REGIONS.CA_CENTRAL_1]: 0.000506,
    [AWS_REGIONS.CN_NORTH_1]: 0.00013,
    [AWS_REGIONS.CN_NORTHWEST_1]: 0.000555,
    [AWS_REGIONS.EU_CENTRAL_1]: 0.000555,
    [AWS_REGIONS.EU_WEST_1]: 0.00037862,
    [AWS_REGIONS.EU_WEST_2]: 0.00034804,
    [AWS_REGIONS.EU_SOUTH_1]: 0.00023314,
    [AWS_REGIONS.EU_WEST_3]: 0.00033854,
    [AWS_REGIONS.EU_NORTH_1]: 0.00003895,
    [AWS_REGIONS.ME_SOUTH_1]: 0.00001189,
    [AWS_REGIONS.SA_EAST_1]: 0.000732,
    [AWS_REGIONS.US_GOV_EAST_1]: 0.0003369284124,
    [AWS_REGIONS.US_GOV_WEST_1]: 0.0001914159801,
  },
  // We are using AWS values for now until we have values for GCP. We also need to update it with the complete list of regions.
  GCP: {
    [GCP_REGIONS.US_EAST1]: 0.0003369284124,
    [GCP_REGIONS.US_CENTRAL1]: 0.0006031871336,
    [GCP_REGIONS.US_WEST1]: 0.0001914159801,
  },
}

export function estimateCo2(estimatedWattHours: number, cloudProvider: string, region: string): number {
  return estimatedWattHours * CLOUD_PROVIDER_WATT_HOURS_CARBON_RATIOS[cloudProvider][region]
}
