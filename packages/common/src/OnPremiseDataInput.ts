/*
 * © 2021 Thoughtworks, Inc.
 */

export type OnPremiseDataInput = {
  cpuId?: string
  memory?: number
  machineType?: string
  startTime?: Date
  endTime?: Date
  country?: string
  region?: string
  cpuUtilization?: number
  powerUsageEffectiveness?: number
}

export type OnPremiseDataOutput = {
  cpuId?: string
  memory?: number
  machineType?: string
  startTime?: Date
  endTime?: Date
  country?: string
  region?: string
  cpuUtilization?: number
  powerUsageEffectiveness?: number
  usageHours: number
  kilowattHours: number
  co2e: number
}
