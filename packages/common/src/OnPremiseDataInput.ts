/*
 * © 2021 Thoughtworks, Inc.
 */

export type OnPremiseDataInput = {
  startTime?: Date
  endTime?: Date
  cpuDescription?: string
  machineName?: string
  memory?: number
  machineType?: string
  country?: string
  region?: string
  cpuUtilization?: number
  powerUsageEffectiveness?: number
  cost?: number
  dailyUptime?: number
  weeklyUptime?: number
  monthlyUptime?: number
  annualUptime?: number
}

export type OnPremiseDataOutput = {
  startTime?: Date
  endTime?: Date
  cpuDescription?: string
  machineName?: string
  memory?: number
  machineType?: string
  country?: string
  region?: string
  cpuUtilization?: number
  powerUsageEffectiveness?: number
  cost?: number
  dailyUptime?: number
  dailyKilowattHours?: number
  dailyCo2e?: number
  weeklyUptime?: number
  weeklyKilowattHours?: number
  weeklyCo2e?: number
  monthlyUptime?: number
  monthlyKilowattHours?: number
  monthlyCo2e?: number
  annualUptime?: number
  annualKilowattHours?: number
  annualCo2e?: number
}
