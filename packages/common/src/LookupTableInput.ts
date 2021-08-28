/*
 * © 2021 Thoughtworks, Inc.
 */

export type LookupTableInput = {
  serviceName: string
  region: string
  usageType: string
  usageUnit: string
  vCpus: string
}

export type LookupTableOutput = {
  serviceName: string
  region: string
  usageType: string
  usageUnit: string
  vCpus: string | number
  kilowattHours: number
  co2e: number
}
