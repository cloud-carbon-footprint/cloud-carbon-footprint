/*
 * © 2021 ThoughtWorks, Inc.
 */

import { EstimationResult } from '@cloud-carbon-footprint/common'

import { FilterResultResponse, UnknownTypes } from '../../utils/models/types'
import moment from 'moment'
import { Dispatch, SetStateAction } from 'react'
import * as FiltersUtil from './FiltersUtil'
import { DropdownFilter } from './FiltersUtil'
import { DropdownOption } from './DropdownFilter'
import { ACCOUNT_OPTIONS } from './AccountFilter'
import { SERVICE_OPTIONS } from './ServiceFilter'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
} from './DropdownConstants'

export type FilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  options?: FilterResultResponse
}
type MaybeDateRange = DateRange | null
type MaybeMoment = moment.Moment | null

interface FiltersConfig {
  timeframe: number
  dateRange: MaybeDateRange
  [DropdownFilter.SERVICES]: DropdownOption[]
  [DropdownFilter.CLOUD_PROVIDERS]: DropdownOption[]
  [DropdownFilter.ACCOUNTS]: DropdownOption[]
}

const defaultFiltersConfig = {
  timeframe: 36,
  dateRange: null,
  [DropdownFilter.SERVICES]: [ALL_SERVICES_DROPDOWN_OPTION],
  [DropdownFilter.CLOUD_PROVIDERS]: CLOUD_PROVIDER_OPTIONS,
  [DropdownFilter.ACCOUNTS]: [ALL_ACCOUNTS_DROPDOWN_OPTION],
}

export const filtersConfigGenerator = ({
  accounts,
  services,
}: FilterResultResponse): FiltersConfig => {
  const configValues = {
    accounts: [ALL_ACCOUNTS_DROPDOWN_OPTION, ...accounts],
    services: [ALL_SERVICES_DROPDOWN_OPTION, ...services],
  }

  return Object.assign(defaultFiltersConfig, configValues)
}

export class Filters {
  readonly timeframe: number
  readonly dateRange: MaybeDateRange
  readonly services: DropdownOption[]
  readonly cloudProviders: DropdownOption[]
  readonly accounts: DropdownOption[]

  constructor(config: FiltersConfig = defaultFiltersConfig) {
    this.timeframe = config.timeframe
    this.services = config.services
    this.cloudProviders = config.cloudProviders
    this.dateRange = config.dateRange
    this.accounts = config.accounts
  }

  withTimeFrame(timeframe: number): Filters {
    return this.timeframe === timeframe
      ? this
      : new Filters({ ...this, dateRange: null, timeframe })
  }

  withServices(services: DropdownOption[]): Filters {
    return new Filters({
      ...this,
      ...FiltersUtil.handleDropdownSelections(
        FiltersUtil.DropdownFilter.SERVICES,
        services,
        {
          services: this.services,
          accounts: this.accounts,
          cloudProviders: this.cloudProviders,
        },
      ),
    })
  }

  withAccounts(accounts: DropdownOption[]): Filters {
    return new Filters({
      ...this,
      ...FiltersUtil.handleDropdownSelections(
        FiltersUtil.DropdownFilter.ACCOUNTS,
        accounts,
        {
          services: this.services,
          accounts: this.accounts,
          cloudProviders: this.cloudProviders,
        },
      ),
    })
  }

  withCloudProviders(cloudProviders: DropdownOption[]): Filters {
    return new Filters({
      ...this,
      ...FiltersUtil.handleDropdownSelections(
        FiltersUtil.DropdownFilter.CLOUD_PROVIDERS,
        cloudProviders,
        {
          services: this.services,
          accounts: this.accounts,
          cloudProviders: this.cloudProviders,
        },
      ),
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
    return FiltersUtil.numSelectedLabel(
      this.services.length,
      SERVICE_OPTIONS.length,
    )
  }

  cloudProviderLabel(): string {
    return FiltersUtil.numSelectedLabel(
      this.cloudProviders.length,
      CLOUD_PROVIDER_OPTIONS.length,
      'Cloud Providers',
    )
  }

  accountLabel(): string {
    return FiltersUtil.numSelectedLabel(
      this.accounts.length,
      ACCOUNT_OPTIONS.length,
      'Accounts',
    )
  }

  filter(rawResults: EstimationResult[]): EstimationResult[] {
    const resultsFilteredByTime = this.getResultsFilteredByTime(rawResults)
    const resultsFilteredByService = this.getResultsFilteredByService(
      resultsFilteredByTime,
    )
    return this.getResultsFilteredByAccount(resultsFilteredByService)
  }

  private getResultsFilteredByAccount(
    resultsFilteredByService: EstimationResult[],
  ): EstimationResult[] {
    const allAccountsSelected = this.accounts.includes(
      ALL_ACCOUNTS_DROPDOWN_OPTION,
    )
    return resultsFilteredByService
      .map((estimationResult) => {
        const filteredServiceEstimates =
          estimationResult.serviceEstimates.filter((serviceEstimate) => {
            return (
              this.accounts.some(
                (account) =>
                  (account.name.includes(UnknownTypes.UNKNOWN_ACCOUNT) &&
                    serviceEstimate.accountName === null) ||
                  account.name === serviceEstimate.accountName,
              ) || allAccountsSelected
            )
          })
        return {
          timestamp: estimationResult.timestamp,
          serviceEstimates: filteredServiceEstimates,
        }
      })
      .filter(
        (estimationResult) => !!estimationResult?.serviceEstimates?.length,
      )
  }

  private getResultsFilteredByService(
    resultsFilteredByTime: EstimationResult[],
  ): EstimationResult[] {
    const allServicesSelected = this.services.includes(
      ALL_SERVICES_DROPDOWN_OPTION,
    )
    return resultsFilteredByTime.map((estimationResult) => {
      const filteredServiceEstimates = estimationResult.serviceEstimates.filter(
        (serviceEstimate) => {
          return (
            this.services.some(
              (service) =>
                (service.key.includes(UnknownTypes.UNKNOWN_SERVICE) &&
                  serviceEstimate.serviceName === null) ||
                service.key === serviceEstimate.serviceName,
            ) || allServicesSelected
          )
        },
      )
      return {
        timestamp: estimationResult.timestamp,
        serviceEstimates: filteredServiceEstimates,
      }
    })
  }

  private getResultsFilteredByTime(
    rawResults: EstimationResult[],
  ): EstimationResult[] {
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

    return rawResults.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(start, end, 'day', '[]'),
    )
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
