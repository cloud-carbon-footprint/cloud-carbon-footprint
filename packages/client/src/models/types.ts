/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import { DropdownOption } from '../dashboard/filters/DropdownFilter'

export interface serviceEstimate {
  cloudProvider: string
  accountName: string
  serviceName: string
  kilowattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant?: boolean
}

export interface ServiceResult<T> {
  data: T[]
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
  kilowattHours?: number
  cost?: number
}

export enum ChartDataTypes {
  REGION = 'region',
  SERVICE = 'service',
  ACCOUNT = 'account',
}

export interface FilterResultResponse {
  accounts: DropdownOption[]
  services: DropdownOption[]
}

export enum UnknownTypes {
  UNKNOWN_REGION = 'Unknown Region',
  UNKNOWN_SERVICE = 'Unknown Service',
  UNKNOWN_ACCOUNT = 'Unknown Account',
}

export interface EmissionsRatios {
  region: string
  mtPerKwHour: number
}
