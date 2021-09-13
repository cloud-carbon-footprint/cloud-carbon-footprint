/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { Filters } from 'common/FilterBar/utils/Filters'
import {
  DropdownFilterOptions,
  DropdownOption,
  FilterOptions,
  FilterResultResponse,
  FiltersConfig,
  unknownOptionTypes,
} from 'Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_DROPDOWN_FILTER_OPTIONS,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
import { EstimationResult, ServiceData } from '@cloud-carbon-footprint/common'
import { AccountChooser } from './options/AccountChooser'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'
import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { CloudProviderChooser } from './options/CloudProviderChooser'
import { ServiceChooser } from './options/ServiceChooser'

const defaultConfig: FiltersConfig = {
  timeframe: 36,
  dateRange: null,
  options: {
    [DropdownFilterOptions.SERVICES]: [ALL_SERVICES_DROPDOWN_OPTION],
    [DropdownFilterOptions.CLOUD_PROVIDERS]: CLOUD_PROVIDER_OPTIONS,
    [DropdownFilterOptions.ACCOUNTS]: [ALL_ACCOUNTS_DROPDOWN_OPTION],
  },
}

export class EmissionsFilters extends Filters {
  constructor(config = defaultConfig) {
    super(config)
  }

  static generateConfig(newOptions: FilterResultResponse): FiltersConfig {
    return super.generateConfig(newOptions, defaultConfig)
  }

  create(config: FiltersConfig): Filters {
    return new EmissionsFilters(config)
  }

  createOptionChooser(
    filterType: DropdownFilterOptions,
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ): OptionChooser {
    switch (filterType) {
      case DropdownFilterOptions.CLOUD_PROVIDERS:
        return new CloudProviderChooser(
          selections,
          oldSelections,
          filterOptions,
        )
      case DropdownFilterOptions.ACCOUNTS:
        return new AccountChooser(selections, oldSelections, filterOptions)
      case DropdownFilterOptions.SERVICES:
        return new ServiceChooser(selections, oldSelections, filterOptions)
    }
  }

  filter(rawResults: EstimationResult[]): EstimationResult[] {
    const resultsFilteredByTime = this.getResultsFilteredByTime(rawResults)
    const resultsFilteredByService = this.getResultsFilteredBy(
      DropdownFilterOptions.SERVICES,
      resultsFilteredByTime,
    )
    return this.getResultsFilteredBy(
      DropdownFilterOptions.ACCOUNTS,
      resultsFilteredByService,
    ).filter((estimationResult) => !!estimationResult?.serviceEstimates?.length)
  }

  private getResultsFilteredByTime(
    previousResults: EstimationResult[],
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

    return previousResults.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(start, end, 'day', '[]'),
    )
  }

  private getResultsFilteredBy(
    type: string,
    previousResults: EstimationResult[],
  ): EstimationResult[] {
    const hasAllOptionsSelected = this.options[type].includes(
      ALL_DROPDOWN_FILTER_OPTIONS[type],
    )
    return previousResults.map((estimationResult) => {
      const filteredServiceEstimates = estimationResult.serviceEstimates.filter(
        (serviceEstimate) =>
          this.options[type].some((dropdownOption) =>
            this.isUnknownOrSameName(dropdownOption, type, serviceEstimate),
          ) || hasAllOptionsSelected,
      )
      return {
        timestamp: estimationResult.timestamp,
        serviceEstimates: filteredServiceEstimates,
      }
    })
  }

  private isUnknownOrSameName(
    dropdownOption: DropdownOption,
    type: string,
    serviceEstimate: ServiceData,
  ) {
    const name =
      type === DropdownFilterOptions.ACCOUNTS ? 'accountName' : 'serviceName'
    return (
      (dropdownOption.name.includes(unknownOptionTypes[type]) &&
        serviceEstimate[name] === null) ||
      dropdownOption.name === serviceEstimate[name]
    )
  }
}
