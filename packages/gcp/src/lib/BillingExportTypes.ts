/*
 * © 2021 Thoughtworks, Inc.
 */
import { QUERY_DATE_TYPES } from '@cloud-carbon-footprint/common'

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
  'Pod mCPU Requests',
  'Pod Memory Requests',
  'Pod Ephemeral Storage Requests',
]

export const UNSUPPORTED_USAGE_TYPES: string[] = [
  'Fee',
  'fee',
  'Billing',
  'Reattribution',
  'Cache Fill',
  'External IP Charge',
  'Static Ip',
  'Vpn Tunnel',
  'Service Charge',
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

export const SERVICES_TO_OVERRIDE_USAGE_UNIT_AS_UNKNOWN: string[] = [
  'Secret Manager',
  'Cloud Key Management Service',
]

export const COMPUTE_STRING_FORMATS: string[] = [
  'Core',
  'CORE',
  'VCPU',
  'vCPU',
  'CPU',
  'CPUs',
  'Kubernetes Clusters',
  'GPU',
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
