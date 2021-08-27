/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import * as FiltersUtil from './FiltersUtil'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
} from './DropdownConstants'
import {
  FilterResultResponse,
  UnknownTypes,
  DropdownOption,
  FilterOptions,
  DropdownFilterOptions,
} from 'Types'

type MaybeDateRange = DateRange | null
type MaybeMoment = moment.Moment | null

interface FiltersConfig {
  timeframe: number
  dateRange: MaybeDateRange
  [DropdownFilterOptions.SERVICES]: DropdownOption[]
  [DropdownFilterOptions.CLOUD_PROVIDERS]: DropdownOption[]
  [DropdownFilterOptions.ACCOUNTS]: DropdownOption[]
}

const defaultFiltersConfig: FiltersConfig = {
  timeframe: 36,
  dateRange: null,
  [DropdownFilterOptions.SERVICES]: [ALL_SERVICES_DROPDOWN_OPTION],
  [DropdownFilterOptions.CLOUD_PROVIDERS]: CLOUD_PROVIDER_OPTIONS,
  [DropdownFilterOptions.ACCOUNTS]: [ALL_ACCOUNTS_DROPDOWN_OPTION],
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

export class Filters {
  readonly timeframe: number
  readonly dateRange: MaybeDateRange
  // TODO: Make this a generic options object
  readonly services: DropdownOption[]
  readonly cloudProviders: DropdownOption[]
  readonly accounts: DropdownOption[]

  constructor(config = defaultFiltersConfig) {
    this.timeframe = config.timeframe
    this.dateRange = config.dateRange
    this.services = config.services
    this.cloudProviders = config.cloudProviders
    this.accounts = config.accounts
  }

  withTimeFrame(timeframe: number): Filters {
    return this.timeframe === timeframe
      ? this
      : new Filters({ ...this, dateRange: null, timeframe })
  }

  withDropdownOption(
    dropdownOption: DropdownOption[],
    filterOptions: FilterOptions,
    dropdownFilter: DropdownFilterOptions,
  ): Filters {
    const oldSelections = {
      services: this.services,
      accounts: this.accounts,
      cloudProviders: this.cloudProviders,
    }
    return new Filters({
      ...this,
      ...FiltersUtil.handleDropdownSelections(
        dropdownFilter,
        dropdownOption,
        oldSelections,
        filterOptions,
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

  label(
    currentOptions: DropdownOption[],
    allOptions: DropdownOption[],
    optionType: string,
  ): string {
    return FiltersUtil.numSelectedLabel(
      currentOptions.length,
      allOptions.length,
      optionType,
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
