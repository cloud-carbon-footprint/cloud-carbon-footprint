export const US_WATTAGE_CARBON_RATIO = 0.70704
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

export const AWS_REGIONS_WATT_HOURS_CARBON_RATIO: { [region: string]: number } = {
  'us-east-2': 0.6031871336,
  'us-east-1': 0.3369284124,
  'us-west-1': 0.1914159801,
  'us-west-2': 0.1425187227,
  'af-south-1': 0.4322281694,
  'ap-east-1': 0.928,
  'ap-south-1': 0.81,
  'ap-northeast-3': 0.708,
  'ap-northeast-2': 0.506,
  'ap-southeast-1': 0.5,
  'ap-southeast-2': 0.4188,
  'ap-northeast-1': 0.79,
  'ca-central-1': 0.506,
  'cn-north-1': 0.13,
  'cn-northwest-1': 0.555,
  'eu-central-1': 0.555,
  'eu-west-1': 0.37862,
  'eu-west-2': 0.34804,
  'eu-south-1': 0.23314,
  'eu-west-3': 0.33854,
  'eu-north-1': 0.03895,
  'me-south-1': 0.01189,
  'sa-east-1': 0.732,
  'us-gov-east-1': 0.3369284124,
  'us-gov-west-1': 0.1914159801,
}

export const regions = ['us-east-1', 'us-east-2']
