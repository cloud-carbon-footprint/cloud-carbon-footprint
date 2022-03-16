/*
 * © 2021 Thoughtworks, Inc.
 */

export type OnPremiseDataInput = {
  machineName?: string
  memory?: number
  machineType?: string
  startTime?: Date
  endTime?: Date
  country?: string
  region?: string
  cpuUtilization?: number
  powerUsageEffectiveness?: number
  cost?: number
}

export type OnPremiseDataOutput = {
  machineName?: string
  memory?: number
  machineType?: string
  startTime?: Date
  endTime?: Date
  country?: string
  region?: string
  cpuUtilization?: number
  powerUsageEffectiveness?: number
  cost?: number
  usageHours: number
  kilowattHours: number
  co2e: number
}
