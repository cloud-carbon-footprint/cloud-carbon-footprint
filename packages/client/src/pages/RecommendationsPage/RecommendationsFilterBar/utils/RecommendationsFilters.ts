/*
 * © 2021 Thoughtworks, Inc.
 */

import { Filters } from 'common/FilterBar/utils/Filters'
import {
  DropdownFilterOptions,
  DropdownOption,
  FilterOptions,
  FilterResultResponse,
  FiltersConfig,
  unknownOptionTypes,
} from 'Types'
import { ALL_DROPDOWN_FILTER_OPTIONS } from 'common/FilterBar/utils/DropdownConstants'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'
import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { AccountChooser } from './options/AccountChooser'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { CloudProviderChooser } from './options/CloudProviderChooser'
import { RegionChooser } from './options/RegionChooser'

const defaultConfig: FiltersConfig = {
  //TODO: add chooser for cloud providers, recommendation types and regions
  options: {
    [DropdownFilterOptions.ACCOUNTS]: [ALL_DROPDOWN_FILTER_OPTIONS.accounts],
    [DropdownFilterOptions.CLOUD_PROVIDERS]: [
      ALL_DROPDOWN_FILTER_OPTIONS.cloudProviders,
    ],
    [DropdownFilterOptions.REGIONS]: [ALL_DROPDOWN_FILTER_OPTIONS.regions],
  },
}

export class RecommendationsFilters extends Filters {
  constructor(config = defaultConfig) {
    super(config)
  }

  static generateConfig(newOptions: FilterResultResponse): FiltersConfig {
    return super.generateConfig(newOptions, defaultConfig)
  }

  create(config: FiltersConfig): Filters {
    return new RecommendationsFilters(config)
  }

  createOptionChooser(
    filterType: DropdownFilterOptions,
    selections: DropdownOption[],
    oldSelections: DropdownSelections,
    filterOptions: FilterOptions,
  ): OptionChooser {
    //TODO: implement for recommendation types and regions
    switch (filterType) {
      case DropdownFilterOptions.ACCOUNTS:
        return new AccountChooser(selections, oldSelections, filterOptions)
      case DropdownFilterOptions.CLOUD_PROVIDERS:
        return new CloudProviderChooser(
          selections,
          oldSelections,
          filterOptions,
        )
      case DropdownFilterOptions.REGIONS:
        return new RegionChooser(selections, oldSelections, filterOptions)
    }
  }

  filter(rawResults: RecommendationResult[]): RecommendationResult[] {
    //TODO: implement for cloud providers, recommendation types and regions
    const resultsFilteredByAccount = this.getResultsFilteredBy(
      DropdownFilterOptions.ACCOUNTS,
      rawResults,
    )

    return this.getResultsFilteredBy(
      DropdownFilterOptions.REGIONS,
      resultsFilteredByAccount,
    )
  }

  private getResultsFilteredBy(
    type: string,
    previousResults: RecommendationResult[],
  ): RecommendationResult[] {
    const hasAllOptionsSelected = this.options[type].includes(
      ALL_DROPDOWN_FILTER_OPTIONS[type],
    )

    return previousResults.filter(
      (recommendationResult) =>
        this.options[type].some((dropdownOption) =>
          this.isUnknownOrSameName(dropdownOption, type, recommendationResult),
        ) || hasAllOptionsSelected,
    )
  }

  private isUnknownOrSameName(
    dropdownOption: DropdownOption,
    type: string,
    recommendationResult: RecommendationResult,
  ) {
    const typeFilterOptionMap = {
      [DropdownFilterOptions.ACCOUNTS]: 'accountName',
      [DropdownFilterOptions.RECOMMENDATION_TYPES]: 'recommendationType',
      [DropdownFilterOptions.REGIONS]: 'region',
    }

    const name = typeFilterOptionMap[type]

    return (
      (dropdownOption.name.includes(unknownOptionTypes[type]) &&
        recommendationResult[name] === null) ||
      dropdownOption.name === recommendationResult[name]
    )
  }
}
