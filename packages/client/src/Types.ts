/*
 * © 2021 ThoughtWorks, Inc.
 */
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { DropdownOption } from './pages/EmissionsMetricsPage/FilterBar/Filters/DropdownFilter'

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

export interface FilterResultResponse {
  accounts: DropdownOption[]
  services: DropdownOption[]
}

export interface Page<T> {
  data: T[]
  page: number
}

export interface PageEntry {
  x: string[]
  y: number
}

export type ApexChartProps = {
  data: EstimationResult[]
  dataType?: string
}

export type DateRange = {
  min: Date | null
  max: Date | null
}

export enum ChartDataTypes {
  REGION = 'region',
  SERVICE = 'service',
  ACCOUNT = 'account',
}

export enum UnknownTypes {
  UNKNOWN_REGION = 'Unknown Region',
  UNKNOWN_SERVICE = 'Unknown Service',
  UNKNOWN_ACCOUNT = 'Unknown Account',
}

export const barChartCustomColors: string[] = [
  '#73B500',
  '#00791E',
  '#D99200',
  '#DF5200',
  '#790000',
]
