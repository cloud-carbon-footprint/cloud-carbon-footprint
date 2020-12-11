/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { EstimationResult, FilterResultResponse } from '../../models/types'
import moment from 'moment'
import { ALL_SERVICES_KEY, ALL_SERVICES_VALUE, SERVICE_OPTIONS } from '../services'
import { ALL_CLOUD_PROVIDERS_KEY, CLOUD_PROVIDER_OPTIONS } from '../cloudProviders'
import { Dispatch, SetStateAction } from 'react'
import { FiltersUtil, FilterType } from './FiltersUtil'
import { DropdownOption } from './DropdownFilter'
import { ACCOUNT_OPTIONS, ALL_ACCOUNTS_KEY, ALL_ACCOUNTS_VALUE } from './AccountFilter'

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
  accounts: DropdownOption[]
}

const allAccountDropdownOption: DropdownOption = { key: ALL_ACCOUNTS_KEY, name: ALL_ACCOUNTS_VALUE, cloudProvider: '' }

const defaultFiltersConfig = {
  timeframe: 12,
  services: SERVICE_OPTIONS,
  cloudProviders: CLOUD_PROVIDER_OPTIONS,
  dateRange: null,
  accounts: [allAccountDropdownOption],
}

export const filtersConfigGenerator = (filteredResponse: FilterResultResponse): FiltersConfig => {
  const accountSet: Set<DropdownOption> = new Set<DropdownOption>()
  accountSet.add(allAccountDropdownOption)
  filteredResponse.accounts.forEach((account) => accountSet.add(account))
  return Object.assign(defaultFiltersConfig, { accounts: Array.from(accountSet) })
}

export class Filters extends FiltersUtil {
  readonly timeframe: number
  readonly services: DropdownOption[]
  readonly cloudProviders: DropdownOption[]
  readonly dateRange: MaybeDateRange
  readonly accounts: DropdownOption[]

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
    const { providerKeys, accountKeys, serviceKeys } = this.handleSelections(
      services,
      this.services,
      ALL_SERVICES_KEY,
      SERVICE_OPTIONS,
      FilterType.SERVICES,
    )
    return new Filters({
      ...this,
      services: serviceKeys,
      accounts: accountKeys,
      cloudProviders: providerKeys,
    })
  }

  withAccounts(accounts: DropdownOption[]): Filters {
    const { providerKeys, accountKeys, serviceKeys } = this.handleSelections(
      accounts,
      this.accounts,
      ALL_ACCOUNTS_KEY,
      ACCOUNT_OPTIONS,
      FilterType.ACCOUNTS,
    )
    return new Filters({
      ...this,
      cloudProviders: providerKeys,
      accounts: accountKeys,
      services: serviceKeys,
    })
  }

  withCloudProviders(cloudProviders: DropdownOption[]): Filters {
    const { providerKeys, accountKeys, serviceKeys } = this.handleSelections(
      cloudProviders,
      this.cloudProviders,
      ALL_CLOUD_PROVIDERS_KEY,
      CLOUD_PROVIDER_OPTIONS,
      FilterType.CLOUD_PROVIDERS,
    )

    return new Filters({
      ...this,
      cloudProviders: providerKeys,
      accounts: accountKeys,
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
    return this.numSelectedLabel(this.accounts.length, ACCOUNT_OPTIONS.length, 'Accounts')
  }

  filter(rawResults: EstimationResult[]): EstimationResult[] {
    const resultsFilteredByTime = this.getResultsFilteredByTime(rawResults)
    const resultsFilteredByService = this.getResultsFilteredByService(resultsFilteredByTime)
    const resultsFilteredByAccount = this.getResultsFilteredByAccount(resultsFilteredByService)
    return resultsFilteredByAccount
  }

  getResultsFilteredByAccount(resultsFilteredByService: EstimationResult[]): EstimationResult[] {
    const allAccountsSelected = this.accounts.includes(allAccountDropdownOption)
    return resultsFilteredByService.map((estimationResult) => {
      const filteredServiceEstimates = estimationResult.serviceEstimates.filter((serviceEstimate) => {
        return this.accounts.some((account) => account.name === serviceEstimate.accountName) || allAccountsSelected
      })
      return { timestamp: estimationResult.timestamp, serviceEstimates: filteredServiceEstimates }
    })
  }

  getResultsFilteredByService(resultsFilteredByTime: EstimationResult[]): EstimationResult[] {
    const allServicesSelected = this.services.includes({ key: ALL_SERVICES_KEY, name: ALL_SERVICES_VALUE })
    return resultsFilteredByTime.map((estimationResult) => {
      const filteredServiceEstimates = estimationResult.serviceEstimates.filter((serviceEstimate) => {
        return this.services.some((service) => service.key === serviceEstimate.serviceName) || allServicesSelected
      })
      return { timestamp: estimationResult.timestamp, serviceEstimates: filteredServiceEstimates }
    })
  }

  getResultsFilteredByTime(rawResults: EstimationResult[]): EstimationResult[] {
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
    return resultsFilteredByTime
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
