/*
 * © 2021 Thoughtworks, Inc.
 */

export type LookupTableInput = {
  id: string
  cost: number
  usageAmount: number
  serviceName: string
  region: string
  usageType: string
  usageUnit: string
  vCpus?: string
  machineType?: string
}

export type LookupTableOutput = {
  id: string
  serviceName: string
  region: string
  usageType: string
  vCpus?: string | number
  machineType?: string
  kilowattHours: number
  co2e: number
}
