/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { EstimationResult, ServiceData } from '@cloud-carbon-footprint/common'
import * as FiltersUtil from './FiltersUtil'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_DROPDOWN_FILTER_OPTIONS,
  ALL_SERVICES_DROPDOWN_OPTION,
  CLOUD_PROVIDER_OPTIONS,
} from './DropdownConstants'
import {
  FilterResultResponse,
  DropdownOption,
  FilterOptions,
  DropdownFilterOptions,
  filterLabels,
  unknownOptionTypes,
  FiltersConfig,
  MaybeFiltersDateRange,
} from 'Types'
import { DropdownSelections } from './FiltersUtil'

type MaybeMoment = moment.Moment | null

const defaultFiltersConfig: FiltersConfig = {
  timeframe: 36,
  dateRange: null,
  options: {
    [DropdownFilterOptions.SERVICES]: [ALL_SERVICES_DROPDOWN_OPTION],
    [DropdownFilterOptions.CLOUD_PROVIDERS]: CLOUD_PROVIDER_OPTIONS,
    [DropdownFilterOptions.ACCOUNTS]: [ALL_ACCOUNTS_DROPDOWN_OPTION],
  },
}

export const filtersConfigGenerator = (
  newOptions: FilterResultResponse,
): FiltersConfig => {
  const updatedOptions = { ...defaultFiltersConfig.options }
  Object.keys(newOptions).map(
    (option) =>
      (updatedOptions[option] = [
        ALL_DROPDOWN_FILTER_OPTIONS[option],
        ...newOptions[option],
      ]),
  )

  const configUpdates = {
    options: { ...updatedOptions },
  }

  return Object.assign(defaultFiltersConfig, configUpdates)
}

export class FiltersDateRange {
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
  readonly dateRange: MaybeFiltersDateRange
  readonly options: DropdownSelections

  constructor(config = defaultFiltersConfig) {
    this.timeframe = config.timeframe
    this.dateRange = config.dateRange
    this.options = { ...config.options }
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
    const oldSelections = { ...this.options }

    return new Filters({
      ...this,
      options: {
        ...FiltersUtil.handleDropdownSelections(
          dropdownFilter,
          dropdownOption,
          oldSelections,
          filterOptions,
        ),
      },
    })
  }

  withDateRange(dateRange: FiltersDateRange): Filters {
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

  label(allOptions: DropdownOption[], optionType: string): string {
    return FiltersUtil.numSelectedLabel(
      this.options[optionType].length,
      allOptions.length,
      filterLabels[optionType],
    )
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

  private getResultsFilteredBy(
    type: string,
    previousFilterResults: EstimationResult[],
  ): EstimationResult[] {
    const hasAllOptionsSelected = this.options[type].includes(
      ALL_DROPDOWN_FILTER_OPTIONS[type],
    )
    return previousFilterResults.map((estimationResult) => {
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
