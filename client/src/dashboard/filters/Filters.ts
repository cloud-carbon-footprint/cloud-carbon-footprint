/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { EstimationResult, FilterResultResponse } from '../../models/types'
import moment from 'moment'
import { ALL_SERVICES, SERVICE_OPTIONS } from '../services'
import { ALL_CLOUD_PROVIDERS, CLOUD_PROVIDER_OPTIONS } from '../cloudProviders'
import { Dispatch, SetStateAction } from 'react'
import { FiltersUtil, FilterType } from './FiltersUtil'
import { Account } from '../../models/FilterInputModels'
import { DropdownOption } from './DropdownFilter'

export type FilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  options?: FilterResultResponse
}
type MaybeDateRange = DateRange | null
type MaybeMoment = moment.Moment | null

interface FiltersConfig {
  timeframe: number
  services: DropdownOption[]
  cloudProviders: DropdownOption[]
  dateRange: MaybeDateRange
  accounts: Account[]
}

const defaultFiltersConfig = {
  timeframe: 12,
  services: SERVICE_OPTIONS,
  cloudProviders: CLOUD_PROVIDER_OPTIONS,
  dateRange: null,
  accounts: [{ cloudProvider: '', key: 'all', name: 'All Accounts' }],
}

export const filtersConfigGenerator = (filteredResponse: FilterResultResponse): FiltersConfig => {
  return Object.assign(defaultFiltersConfig, filteredResponse)
}

export class Filters extends FiltersUtil {
  readonly timeframe: number
  readonly services: DropdownOption[]
  readonly cloudProviders: DropdownOption[]
  readonly dateRange: MaybeDateRange
  readonly accounts: Account[]

  constructor(config: FiltersConfig = defaultFiltersConfig) {
    super()
    this.timeframe = config.timeframe
    this.services = config.services
    this.cloudProviders = config.cloudProviders
    this.dateRange = config.dateRange
    this.accounts = config.accounts
  }

  withTimeFrame(timeframe: number): Filters {
    return this.timeframe === timeframe ? this : new Filters({ ...this, dateRange: null, timeframe })
  }

  withServices(services: DropdownOption[]): Filters {
    const { providerKeys, serviceKeys } = this.handleSelections(
      services,
      this.services,
      ALL_SERVICES,
      SERVICE_OPTIONS,
      FilterType.SERVICES,
    )
    return new Filters({
      ...this,
      services: serviceKeys,
      cloudProviders: providerKeys,
    })
  }

  withAccounts(accounts: DropdownOption[]): Filters {
    return new Filters({
      ...this,
      accounts: accounts,
    })
  }

  withCloudProviders(cloudProviders: DropdownOption[]): Filters {
    const { providerKeys, serviceKeys } = this.handleSelections(
      cloudProviders,
      this.cloudProviders,
      ALL_CLOUD_PROVIDERS,
      CLOUD_PROVIDER_OPTIONS,
      FilterType.CLOUD_PROVIDERS,
    )
    return new Filters({
      ...this,
      cloudProviders: providerKeys,
      services: serviceKeys,
    })
  }

  withDateRange(dateRange: DateRange): Filters {
    if (dateRange.isComplete()) {
      return new Filters({
        ...this,
        timeframe: -1,
        dateRange,
      })
    } else {
      return new Filters({
        ...this,
        dateRange,
      })
    }
  }

  serviceLabel(): string {
    return this.numSelectedLabel(this.services.length, SERVICE_OPTIONS.length)
  }

  cloudProviderLabel(): string {
    return this.numSelectedLabel(this.cloudProviders.length, CLOUD_PROVIDER_OPTIONS.length, 'Cloud Providers')
  }

  accountLabel(): string {
    return this.numSelectedLabel(this.accounts.length, this.accounts.length, 'Accounts')
  }

  filter(rawResults: EstimationResult[]): EstimationResult[] {
    const today = moment.utc()
    let start: moment.Moment
    let end: moment.Moment
    if (this.timeframe < 0 && this.dateRange?.startDate) {
      start = this.dateRange.startDate
      end = this.dateRange.endDate || today
    } else {
      end = today
      start = end.clone().subtract(this.timeframe, 'M')
    }

    const resultsFilteredByTime = rawResults.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(start, end, 'day', '[]'),
    )

    const allServicesSelected = this.services.includes({ key: ALL_SERVICES, name: 'All Services' })
    return resultsFilteredByTime.map((estimationResult) => {
      const filteredServiceEstimates = estimationResult.serviceEstimates.filter((serviceEstimate) => {
        return this.services.some((service) => service.key === serviceEstimate.serviceName) || allServicesSelected
      })
      return { timestamp: estimationResult.timestamp, serviceEstimates: filteredServiceEstimates }
    })
  }
}

export class DateRange {
  readonly startDate: MaybeMoment
  readonly endDate: MaybeMoment

  constructor(startDate: MaybeMoment, endDate: MaybeMoment) {
    this.startDate = startDate
    this.endDate = endDate
  }

  isComplete(): boolean {
    return this.startDate !== null && this.endDate !== null
  }
}
