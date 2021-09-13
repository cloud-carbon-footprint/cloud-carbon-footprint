/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'

import * as FiltersUtil from './FiltersUtil'
import { ALL_DROPDOWN_FILTER_OPTIONS } from './DropdownConstants'
import {
  FilterResultResponse,
  DropdownOption,
  FilterOptions,
  DropdownFilterOptions,
  filterLabels,
  FiltersConfig,
  MaybeFiltersDateRange,
  FilterResults,
} from 'Types'
import { DropdownSelections } from './FiltersUtil'
import { OptionChooser } from './OptionChooser'

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

export abstract class Filters {
  readonly timeframe: number
  readonly dateRange: MaybeFiltersDateRange
  readonly options: DropdownSelections

  protected constructor(config: FiltersConfig) {
    this.timeframe = config.timeframe
    this.dateRange = config.dateRange
    this.options = { ...config.options }
  }

  protected abstract create(config: FiltersConfig): Filters

  abstract createOptionChooser(
    filterType: DropdownFilterOptions,
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ): OptionChooser

  abstract filter(rawResults: FilterResults): FilterResults

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
      : this.create({ ...this, dateRange: null, timeframe })
  }

  withDropdownOption(
    dropdownOption: DropdownOption[],
    filterOptions: FilterOptions,
    dropdownFilter: DropdownFilterOptions,
  ): Filters {
    const oldSelections = { ...this.options }
    const optionChooser = this.createOptionChooser(
      dropdownFilter,
      dropdownOption,
      oldSelections,
      filterOptions,
    )

    return this.create({
      ...this,
      options: {
        ...FiltersUtil.handleDropdownSelections(optionChooser),
      },
    })
  }

  withDateRange(dateRange: FiltersDateRange): Filters {
    if (dateRange.isComplete()) {
      return this.create({
        ...this,
        timeframe: -1,
        dateRange,
      })
    } else {
      return this.create({
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
}
