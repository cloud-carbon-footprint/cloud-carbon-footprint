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
  serverUtilization?: number
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
  serverUtilization?: number
  powerUsageEffectiveness?: number
  kilowattHours: number
  co2e: number
}
