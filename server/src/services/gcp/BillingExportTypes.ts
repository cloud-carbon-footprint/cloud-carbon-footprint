/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
export const NETWORKING_USAGE_TYPES: string[] = [
  'IP address reservation',
  'IP address idling',
  'External IP Charge',
  'Load Balancing',
  'NAT Gateway',
  'Static Ip Charge',
  'Vpn Tunnel',
]

export const MEMORY_USAGE_TYPES: string[] = ['RAM', 'Ram', 'Memory', 'Redis Capacity']

export const UNKNOWN_USAGE_TYPES: string[] = [
  'Licensing Fee',
  'Commitment',
  'Commit',
  'GPU', // Currently unsupported for carbon estimation
]

export const UNKNOWN_SERVICE_TYPES: string[] = [
  'Cloud DNS',
  'Cloud Key Management Service',
  'Cloud Machine Learning Engine',
  'Cloud Spanner',
  'Cloud Speech API',
  'SendGrid',
  'Support',
  'Secret Manager',
  'Cloud Build',
  'Kubernetes Engine',
  'Cloud Run',
  'Cloud Data Fusion',
]

export const COMPUTE_STRING_FORMATS: string[] = [
  'Core',
  'CORE',
  'instance',
  'VCPU',
  'vCPU',
  'CPU',
  'Server node',
  'Backend Instances',
  'Frontend Instances',
  'Server Node',
]
