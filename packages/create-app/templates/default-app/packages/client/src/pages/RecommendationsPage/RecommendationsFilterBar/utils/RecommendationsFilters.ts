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
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_DROPDOWN_FILTER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
import { DropdownSelections } from 'common/FilterBar/utils/FiltersUtil'
import { OptionChooser } from 'common/FilterBar/utils/OptionChooser'
import { AccountChooser } from './options/AccountChooser'
import { RecommendationResult } from '@cloud-carbon-footprint/common'

const defaultConfig: FiltersConfig = {
  options: {
    [DropdownFilterOptions.ACCOUNTS]: [ALL_ACCOUNTS_DROPDOWN_OPTION],
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
    switch (filterType) {
      case DropdownFilterOptions.ACCOUNTS:
        return new AccountChooser(selections, oldSelections, filterOptions)
    }
  }

  filter(rawResults: RecommendationResult[]): RecommendationResult[] {
    const resultsFilteredByRecommendationType = this.getResultsFilteredBy(
      DropdownFilterOptions.RECOMMENDATION_TYPES,
      rawResults,
    )
    const resultsFilteredByRegion = this.getResultsFilteredBy(
      DropdownFilterOptions.REGIONS,
      resultsFilteredByRecommendationType,
    )

    return this.getResultsFilteredBy(
      DropdownFilterOptions.ACCOUNTS,
      resultsFilteredByRegion,
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
