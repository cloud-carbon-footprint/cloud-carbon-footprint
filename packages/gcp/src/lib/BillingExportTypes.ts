/*
 * © 2021 Thoughtworks, Inc.
 */
import { QUERY_DATE_TYPES } from '@cloud-carbon-footprint/common'
import { EstimateClassification } from '@cloud-carbon-footprint/core'

export const MEMORY_USAGE_TYPES: string[] = ['RAM', 'Ram', 'Memory']

export const UNKNOWN_USAGE_UNITS: string[] = ['requests']

export const UNKNOWN_USAGE_TYPES: string[] = [
  'Dedicated Memcache',
  'BigQuery BI Engine',
  'AutoML Tables Deployment',
  'Local Disk Time Dataprep',
  'Shuffle Time',
  'Snapshots message backlog',
  'Subscriptions message backlog',
  'Subscriptions retained acknowledged messages',
  'Cloud SQL: Backups',
  'Publisher Throughput Capacity',
  'Subscriber Throughput Capacity',
  'Server node',
  'Backend Instances',
  'Frontend Instances',
  'Server Node',
  'Analysis Slots Attribution',
  'Build time',
  'Dataprep Unit',
  'IP address',
  'usage - hour',
  'D2',
  'D4',
  'Policy Charge',
  'Endpoint Charge',
  'NAT Gateway',
  'Action Time',
  'Billing Adjustment',
  'Filestore Capacity Premium',
  'Filestore Capacity Standard',
]

export const UNSUPPORTED_USAGE_TYPES: string[] = [
  'Fee',
  'fee',
  'Billing',
  'Commitment',
  'Reattribution',
  'Commit',
  'Cache Fill',
  'External IP Charge',
  'Load Balancing',
  'Static Ip',
  'Vpn Tunnel',
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
  'Cloud Dialogflow API',
  'Cloud Natural Language',
  'BigQuery Data Transfer Service',
  'BigQuery Reservation API',
  'Cloud AutoML',
  'Cloud Test Lab',
  'Cloud TPU',
  'Cloud Video Intelligence API',
  'Cloud Vision API',
  'Container Builder',
  'Firebase Test Lab',
  'Security Command Center',
  'Stackdriver',
]

export const UNKNOWN_USAGE_UNIT_TO_ASSUMED_USAGE_MAPPING: {
  [key: string]: string[]
} = {
  seconds: [EstimateClassification.COMPUTE],
  bytes: [EstimateClassification.NETWORKING],
  'byte-seconds': [
    EstimateClassification.STORAGE,
    EstimateClassification.MEMORY,
  ],
}

export const UNKNOWN_USAGE_TYPE_TO_ASSUMED_USAGE_MAPPING: {
  [key: string]: string
} = {
  Analysis: EstimateClassification.COMPUTE,
  'Streaming Insert': EstimateClassification.COMPUTE,
  'Data Fusion Basic': EstimateClassification.UNKNOWN,
  'Data Fusion Developer': EstimateClassification.UNKNOWN,
  'Content Bytes Inspected': EstimateClassification.COMPUTE,
  'Content Bytes Transformed': EstimateClassification.COMPUTE,
  'Shuffle chargeable data processed': EstimateClassification.COMPUTE,
  ManagedZone: EstimateClassification.UNKNOWN,
  'Device Data Volume': EstimateClassification.STORAGE,
  'IP address reservation': EstimateClassification.UNKNOWN,
  'Data Retrieval': EstimateClassification.COMPUTE,
  'Cloud Armor Policy Charge': EstimateClassification.UNKNOWN,
  'NAT Gateway: Data processing charge': EstimateClassification.COMPUTE,
  'Commit (1 year)': EstimateClassification.UNKNOWN,
  'Secret version replica storage': EstimateClassification.STORAGE,
  'Email Pro 100k plan': EstimateClassification.UNKNOWN,
  'Log Volume': EstimateClassification.STORAGE,
  'Metric Volume': EstimateClassification.STORAGE,
  'GCP Support': EstimateClassification.UNKNOWN,
}

export const COMPUTE_STRING_FORMATS: string[] = [
  'Core',
  'CORE',
  'VCPU',
  'vCPU',
  'CPU',
]

export const NETWORKING_STRING_FORMATS: string[] = [
  'Egress',
  'egress',
  'data delivery',
  'network traffic',
  'Download',
]

export const GCP_QUERY_GROUP_BY: QUERY_DATE_TYPES = {
  day: 'DAY',
  week: 'ISOWEEK',
  month: 'MONTH',
  quarter: 'QUARTER',
  year: 'YEAR',
}
