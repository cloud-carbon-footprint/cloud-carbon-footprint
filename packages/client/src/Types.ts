/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { Dispatch, ReactNode, SetStateAction } from 'react'
import {
  EstimationResult,
  RecommendationResult,
} from '@cloud-carbon-footprint/common'
import { Filters, FiltersDateRange } from './common/FilterBar/utils/Filters'
import { DropdownSelections } from './common/FilterBar/utils/FiltersUtil'

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

export interface AllFilterOptionMap {
  [type: string]: DropdownOption
}

export interface FilterOptions {
  [filterOption: string]: DropdownOption[]
}

export interface FilterResultResponse {
  accounts: DropdownOption[]
  services?: DropdownOption[]
  recommendationTypes?: DropdownOption[]
  regions?: DropdownOption[]
}

export interface FiltersConfig {
  timeframe?: number
  dateRange?: MaybeFiltersDateRange
  options: DropdownSelections
}

export type FilterBarProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  filteredDataResults: FilterResultResponse
}

export interface Page<T> {
  data: T[]
  page: number
}

export interface PageEntry {
  x: string[]
  y: number
}

export type MaybeFiltersDateRange = FiltersDateRange | null

export type ApexChartProps = {
  data: EstimationResult[]
  dataType?: string
}

export type SidePanelProps = {
  drawerWidth: number
  title: string
  children: ReactNode
  defaultIsOpen?: boolean
  openOnChange?: RecommendationRow
}

export type FilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  options: FilterOptions
}

export type FilterLabelMapping = { [type in DropdownFilterOptions]?: string }

export type UnknownTypesMapping = {
  [type in DropdownFilterOptions]?: UnknownTypes
}

export type FilterResults = EstimationResult[] | RecommendationResult[]

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
  UNKNOWN_RECOMMENDATION_TYPE = 'Unknown Recommendation Type',
}

export enum DropdownFilterOptions {
  SERVICES = 'services',
  CLOUD_PROVIDERS = 'cloudProviders',
  ACCOUNTS = 'accounts',
  RECOMMENDATION_TYPES = 'recommendationTypes',
  REGIONS = 'regions',
}

export const barChartCustomColors: string[] = [
  '#73B500',
  '#00791E',
  '#D99200',
  '#DF5200',
  '#790000',
]

export const filterLabels: FilterLabelMapping = {
  [DropdownFilterOptions.ACCOUNTS]: 'Accounts',
  [DropdownFilterOptions.SERVICES]: 'Services',
  [DropdownFilterOptions.CLOUD_PROVIDERS]: 'Cloud Providers',
  [DropdownFilterOptions.REGIONS]: 'Regions',
  [DropdownFilterOptions.RECOMMENDATION_TYPES]: 'Recommendation Types',
}

export const unknownOptionTypes: UnknownTypesMapping = {
  [DropdownFilterOptions.ACCOUNTS]: UnknownTypes.UNKNOWN_ACCOUNT,
  [DropdownFilterOptions.SERVICES]: UnknownTypes.UNKNOWN_SERVICE,
  [DropdownFilterOptions.REGIONS]: UnknownTypes.UNKNOWN_REGION,
}
