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
  usageAmount?: string | number
  cost?: string | number
}

export type LookupTableOutput = {
  serviceName: string
  region: string
  usageType: string
  vCpus?: string | number
  machineType?: string
  kilowattHours: number
  co2e: number
}
