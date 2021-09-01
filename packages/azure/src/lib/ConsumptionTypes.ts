/*
 * © 2021 Thoughtworks, Inc.
 */

import { QUERY_DATE_TYPES } from '@cloud-carbon-footprint/common'
import { EstimateClassification } from '@cloud-carbon-footprint/core'

export type TenantHeaders = {
  [key: string]: string
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
  HOURS_10 = '10 Hours',
  HOURS_100 = '100 Hours',
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

enum UNKNOWN_USAGE_UNITS {
  UNIT_2 = '2',
  UNIT_100000 = '100000',
  UNIT_1000000 = '1000000',
  UNIT_10000000 = '10000000',
  UNIT_100000000 = '100000000',
  GB_1000 = '1000 GB',
  HOUR_100 = '100 /Hour',
  HOUR_1000 = '1000 /Hour',
  MONTH_10 = '10 /Month',
  HOURS_200 = '200 Hours',
}

export const UNKNOWN_USAGE_TO_ASSUMED_USAGE_MAPPING: {
  [key: string]: string[]
} = {
  [COMPUTE_USAGE_UNITS.HOUR_1]: [EstimateClassification.COMPUTE],
  [COMPUTE_USAGE_UNITS.HOURS_10]: [EstimateClassification.COMPUTE],
  [COMPUTE_USAGE_UNITS.HOURS_100]: [EstimateClassification.COMPUTE],
  [COMPUTE_USAGE_UNITS.HOURS_1000]: [EstimateClassification.COMPUTE],
  [STORAGE_USAGE_UNITS.MONTH_1]: [EstimateClassification.STORAGE],
  [STORAGE_USAGE_UNITS.MONTH_100]: [EstimateClassification.STORAGE],
  [STORAGE_USAGE_UNITS.GB_MONTH_1]: [EstimateClassification.STORAGE],
  [STORAGE_USAGE_UNITS.GB_MONTH_10]: [EstimateClassification.STORAGE],
  [STORAGE_USAGE_UNITS.GB_MONTH_100]: [EstimateClassification.STORAGE],
  [STORAGE_USAGE_UNITS.DAY_10]: [EstimateClassification.STORAGE],
  [STORAGE_USAGE_UNITS.DAY_30]: [EstimateClassification.STORAGE],
  [STORAGE_USAGE_UNITS.TB_MONTH_1]: [EstimateClassification.STORAGE],
  [NETWORKING_USAGE_UNITS.GB_1]: [EstimateClassification.NETWORKING],
  [NETWORKING_USAGE_UNITS.TB_1]: [EstimateClassification.NETWORKING],
  [NETWORKING_USAGE_UNITS.GB_10]: [EstimateClassification.NETWORKING],
  [NETWORKING_USAGE_UNITS.GB_100]: [EstimateClassification.NETWORKING],
  [NETWORKING_USAGE_UNITS.GB_200]: [EstimateClassification.NETWORKING],
  [MEMORY_USAGE_UNITS.GB_SECONDS_50000]: [EstimateClassification.MEMORY],
  [MEMORY_USAGE_UNITS.GB_HOURS_1000]: [EstimateClassification.MEMORY],
  [UNKNOWN_USAGE_UNITS.UNIT_2]: [EstimateClassification.UNKNOWN],
  [UNKNOWN_USAGE_UNITS.UNIT_100000]: [EstimateClassification.COMPUTE],
  [UNKNOWN_USAGE_UNITS.UNIT_1000000]: [EstimateClassification.COMPUTE],
  [UNKNOWN_USAGE_UNITS.UNIT_10000000]: [EstimateClassification.COMPUTE],
  [UNKNOWN_USAGE_UNITS.UNIT_100000000]: [EstimateClassification.COMPUTE],
  [UNKNOWN_USAGE_UNITS.GB_1000]: [EstimateClassification.NETWORKING],
  [UNKNOWN_USAGE_UNITS.HOUR_100]: [EstimateClassification.COMPUTE],
  [UNKNOWN_USAGE_UNITS.HOUR_1000]: [EstimateClassification.COMPUTE],
  [UNKNOWN_USAGE_UNITS.MONTH_10]: [EstimateClassification.STORAGE],
  [UNKNOWN_USAGE_UNITS.HOURS_200]: [EstimateClassification.COMPUTE],
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
  C0: 250,
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
