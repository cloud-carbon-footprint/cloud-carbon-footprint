/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

export interface serviceEstimate {
  cloudProvider: string
  accountName: string
  serviceName: string
  wattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant?: boolean
}

export interface ServiceResult {
  data: EstimationResult[]
  loading: boolean
}

export interface EstimationResult {
  timestamp: Date
  serviceEstimates: serviceEstimate[]
}

export interface cloudEstPerDay {
  x: Date
  y: number
  usesAverageCPUConstant?: boolean
  wattHours?: number
  cost?: number
}

export enum ChartDataTypes {
  REGION = 'region',
  SERVICE = 'service',
}

export interface Account {
  cloudProvider: string
  id: string
  name: string
}

export interface FilterResultResponse {
  accounts: Account[]
}
