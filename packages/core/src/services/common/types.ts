/*
 * © 2021 ThoughtWorks, Inc.
 */

export type QUERY_DATE_TYPES = {
  [key: string]: string
}

export interface EstimationResult {
  readonly timestamp: Date
  readonly serviceEstimates: ServiceData[]
}

export interface ServiceData {
  readonly cloudProvider: string
  readonly accountName: string
  readonly serviceName: string
  readonly kilowattHours: number
  readonly co2e: number
  readonly cost: number
  readonly region: string
  readonly usesAverageCPUConstant: boolean
}
