/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

export const UNSUPPORTED_SERVICES = [
  'Virtual Machines Licenses',
  'Azure Bastion',
  'Load Balancer',
  'VPN Gateway',
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
  GB_MONTH_10 = '10 GB/Month',
}

export const STORAGE_USAGE_TYPES: string[] = [
  'Data Stored',
  'Metadata',
  'Registry Unit',
]

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
