/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { EstimationResult, ServiceData } from '@cloud-carbon-footprint/common'
import * as FiltersUtil from './FiltersUtil'
import { ALL_DROPDOWN_FILTER_OPTIONS } from './DropdownConstants'
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

  constructor(config: FiltersConfig) {
    this.timeframe = config.timeframe
    this.dateRange = config.dateRange
    this.options = { ...config.options }
  }

  static generateConfig(
    newOptions: FilterResultResponse,
    oldConfig: FiltersConfig,
  ): FiltersConfig {
    const updatedOptions = { ...oldConfig.options }
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

    return Object.assign(oldConfig, configUpdates)
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
