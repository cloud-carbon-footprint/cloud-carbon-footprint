/*
 * © 2021 Thoughtworks, Inc.
 */

import { QUERY_DATE_TYPES } from '@cloud-carbon-footprint/common'
import { LegacyUsageDetail, ModernUsageDetail } from '@azure/arm-consumption'

export type TenantHeaders = {
  [key: string]: string
}

export type TenantHeaderMapValue = {
  name: string
  value: number
}

export type UsageRowPageErrorResponse = {
  response: {
    headers: {
      _headersMap: Map<string, TenantHeaderMapValue>
    }
  }
  message: string
}

type AzureTags = {
  [tagKey: string]: string
}

export type UsageDetailResult = {
  id: string
  name: string
  type: string
  tags: AzureTags
  kind: string
  properties: LegacyUsageDetail | ModernUsageDetail
}

export const UNKNOWN_SERVICES: string[] = [
  'Azure Bastion',
  'Load Balancer',
  'VPN Gateway',
  'Azure Front Door Service',
  'Azure Databricks',
  'Azure Data Factory v2',
  'API Management',
  'Advanced Data Security',
  'Virtual Machines Licenses',
]

export const UNKNOWN_USAGE_TYPES: string[] = [
  'Server - Free',
  'Requests',
  'Custom Domain',
]

export const UNSUPPORTED_USAGE_TYPES: string[] = [
  'Rulesets',
  'Rules',
  'Policies',
  'Kafka Surcharge',
  'License',
]

export enum COMPUTE_USAGE_UNITS {
  HOUR_1 = '1 Hour',
  HOUR_10 = '10 Hour',
  HOURS_10 = '10 Hours',
  HOUR_100 = '100 Hour',
  HOURS_100 = '100 Hours',
  HOUR_1000 = '1000 Hour',
  HOURS_1000 = '1000 Hours',
}

export enum STORAGE_USAGE_UNITS {
  MONTH_1 = '1 /Month',
  MONTH_100 = '100 /Month',
  GB_MONTH_1 = '1 GB/Month',
  GB_MONTH_10 = '10 GB/Month',
  GB_MONTH_100 = '100 GB/Month',
  DAY_10 = '10 /Day',
  DAY_30 = '30 /Day',
  TB_MONTH_1 = '1 TB/Month',
}

export enum NETWORKING_USAGE_UNITS {
  GB_1 = '1 GB',
  TB_1 = '1 TB',
  GB_10 = '10 GB',
  GB_100 = '100 GB',
  GB_200 = '200 GB',
}

export enum MEMORY_USAGE_UNITS {
  GB_SECONDS_50000 = '50000 GB Seconds',
  GB_HOURS_1000 = '1000 GB Hours',
}

export const STORAGE_USAGE_TYPES: string[] = [
  'Data Stored',
  'Metadata',
  'Registry Unit',
  'ZRS',
  'LRS',
  'GRS',
  'GZRS',
  'Data Retention',
  'Pay-as-you-go Data at Rest',
  'Standard Instances',
  'Node',
  '10 DTUs',
  'S0 DTUs',
  'B DTUs',
  'B DTU',
  'eDTUs',
  'On Premises Server Protected Instances',
  'Standard Trial Nodes',
  'Azure VM Protected Instances',
  'Standard User',
  'Multi-step Web Test',
  'S0 Secondary Active DTUs',
  'Resource Monitored at 5 Minute Frequency',
  'VM Replicated to Azure',
  'Basic User',
  'Standard Nodes',
  'Microsoft-hosted CI',
]

export const NETWORKING_USAGE_TYPES: string[] = [
  'Geo-Replication Data transfer',
  'Data Transfer Out',
  'Egress',
  'Geo-Replication v2 Data transfer',
  'Data Processed - Egress',
]

export const MEMORY_USAGE_TYPES: string[] = [
  'Execution Time',
  'Memory Duration',
  'C1 Cache Instance',
]

export const CACHE_MEMORY_GB: {
  [cacheName: string]: number
} = {
  C0: 0.25,
  C1: 1,
  C2: 2.5,
  C3: 6,
  C4: 13,
  C5: 26,
  C6: 53,
  P1: 6,
  P2: 13,
  P3: 26,
  P4: 53,
  P5: 120,
  E10: 12,
  E20: 25,
  E50: 50,
  E100: 100,
  F300: 384,
  F700: 715,
  F1500: 1455,
}

export const SSD_MANAGED_DISKS_STORAGE_GB: {
  [diskType: string]: number
} = {
  P1: 4,
  P2: 8,
  P3: 16,
  P4: 32,
  P6: 64,
  P10: 128,
  P15: 256,
  P20: 512,
  P30: 1024,
  P40: 2048,
  P50: 4096,
  P60: 8192,
  P70: 16384,
  P80: 32767,
  E1: 4,
  E2: 8,
  E3: 16,
  E4: 32,
  E6: 64,
  E10: 128,
  E15: 256,
  E20: 512,
  E30: 1024,
  E40: 2048,
  E50: 4096,
  E60: 8192,
  E70: 16384,
  E80: 32767,
}

export const HDD_MANAGED_DISKS_STORAGE_GB: {
  [diskType: string]: number
} = {
  S4: 32,
  S6: 64,
  S10: 128,
  S15: 256,
  S20: 512,
  S30: 1024,
  S40: 2048,
  S50: 4096,
  S60: 8192,
  S70: 16384,
  S80: 32767,
}

export const CONTAINER_REGISTRY_STORAGE_GB: {
  [registryType: string]: number
} = {
  Basic: 10,
  Standard: 100,
  Premium: 500,
}

export const AZURE_QUERY_GROUP_BY: QUERY_DATE_TYPES = {
  day: 'day',
  week: 'isoWeek',
  month: 'month',
  quarter: 'quarter',
  year: 'year',
}
