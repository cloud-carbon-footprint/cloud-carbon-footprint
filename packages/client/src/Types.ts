/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { Dispatch, ReactNode, SetStateAction } from 'react'
import {
  EstimationResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import { Filters } from './pages/EmissionsMetricsPage/EmissionsFilterBar/utils/Filters'

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

export interface DropdownOption {
  key: string
  name: string
  cloudProvider?: string
}

export interface FilterOptions {
  [filterOption: string]: DropdownOption[]
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

export type SidePanelProps = {
  drawerWidth: number
  title: string
  children: ReactNode
  defaultIsOpen?: boolean
  triggerOpenOnChange?: boolean
}

export type FilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  options?: FilterOptions
}

export type DateRange = {
  min: Date | null
  max: Date | null
}

export type Source = {
  href: string
  title: string
}

export type ComparisonItem = {
  icon: React.ReactNode
  total: number
  textOne: string
  textTwo: string
  source: Source
}

export type RecommendationRow = RecommendationResult & {
  id: number
  useKilograms: boolean
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
