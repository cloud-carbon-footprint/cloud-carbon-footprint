/*
 * © 2021 ThoughtWorks, Inc.
 */
import { DropdownOption } from '../../dashboard/filters/DropdownFilter'

export interface ServiceResult<T> {
  data: T[]
  loading: boolean
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

export const chartBarCustomColors: string[] = [
  '#73B500',
  '#00791E',
  '#D99200',
  '#DF5200',
  '#790000',
]
