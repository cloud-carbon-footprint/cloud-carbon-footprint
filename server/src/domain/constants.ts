export const SSDCOEFFICIENT = 1.2
export const HDDCOEFFICIENT = 0.67
export const MIN_WATTS = 0.61
export const MAX_WATTS = 3.15
export const AWS_POWER_USAGE_EFFECTIVENESS = 1.2
export const CACHE_NODE_TYPES: { [nodeType: string]: number } = {
  'cache.t2.micro': 1,
  'cache.t2.small': 1,
  'cache.t2.medium': 2,
  'cache.t3.micro': 2,
  'cache.t3.small': 2,
  'cache.t3.medium': 2,
}

export enum AWS_REGIONS {
  US_EAST_2 = 'us-east-2',
  US_EAST_1 = 'us-east-1',
  US_WEST_1 = 'us-west-1',
  US_WEST_2 = 'us-west-2',
  AF_SOUTH_1 = 'af-south-1',
  AP_EAST_1 = 'ap-east-1',
  AP_SOUTH_1 = 'ap-south-1',
  AP_NORTHEAST_3 = 'ap-northeast-3',
  AP_NORTHEAST_2 = 'ap-northeast-2',
  AP_SOUTHEAST_1 = 'ap-southeast-1',
  AP_SOUTHEAST_2 = 'ap-southeast-2',
  AP_NORTHEAST_1 = 'ap-northeast-1',
  CA_CENTRAL_1 = 'ca-central-1',
  CN_NORTH_1 = 'cn-north-1',
  CN_NORTHWEST_1 = 'cn-northwest-1',
  EU_CENTRAL_1 = 'eu-central-1',
  EU_WEST_1 = 'eu-west-1',
  EU_WEST_2 = 'eu-west-2',
  EU_SOUTH_1 = 'eu-south-1',
  EU_WEST_3 = 'eu-west-3',
  EU_NORTH_1 = 'eu-north-1',
  ME_SOUTH_1 = 'me-south-1',
  SA_EAST_1 = 'sa-east-1',
  US_GOV_EAST_1 = 'us-gov-east-1',
  US_GOV_WEST_1 = 'us-gov-west-1',
}

export const AWS_REGIONS_WATT_HOURS_CARBON_RATIO: { [region: string]: number } = {
  [AWS_REGIONS.US_EAST_2]: 0.0006031871336,
  [AWS_REGIONS.US_EAST_1]: 0.0003369284124,
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
}

export const regions = [AWS_REGIONS.US_EAST_1.toString(), AWS_REGIONS.US_EAST_2.toString()]
