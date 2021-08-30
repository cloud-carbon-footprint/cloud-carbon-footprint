/*
 * © 2021 Thoughtworks, Inc.
 */

export type LookupTableInput = {
  serviceName: string
  region: string
  usageType: string
  usageUnit: string
  vCpus?: string
  machineType?: string
}

export type LookupTableOutput = {
  serviceName: string
  region: string
  usageType: string
  usageUnit: string
  vCpus?: string | number
  machineType?: string
  kilowattHours: number
  co2e: number
}
