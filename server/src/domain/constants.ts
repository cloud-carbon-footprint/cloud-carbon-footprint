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
  'us-east-2': 0.0006031871336,
  'us-east-1': 0.0003369284124,
  'us-west-1': 0.0001914159801,
  'us-west-2': 0.0001425187227,
  'af-south-1': 0.0004322281694,
  'ap-east-1': 0.000928,
  'ap-south-1': 0.00081,
  'ap-northeast-3': 0.000708,
  'ap-northeast-2': 0.000506,
  'ap-southeast-1': 0.0005,
  'ap-southeast-2': 0.0004188,
  'ap-northeast-1': 0.00079,
  'ca-central-1': 0.000506,
  'cn-north-1': 0.00013,
  'cn-northwest-1': 0.000555,
  'eu-central-1': 0.000555,
  'eu-west-1': 0.00037862,
  'eu-west-2': 0.00034804,
  'eu-south-1': 0.00023314,
  'eu-west-3': 0.00033854,
  'eu-north-1': 0.00003895,
  'me-south-1': 0.00001189,
  'sa-east-1': 0.000732,
  'us-gov-east-1': 0.0003369284124,
  'us-gov-west-1': 0.0001914159801,
}

export const regions = ['us-east-1', 'us-east-2']
