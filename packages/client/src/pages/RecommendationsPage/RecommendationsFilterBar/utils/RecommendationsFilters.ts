/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  RecommendationResult,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import { Filters } from '../../../../common/FilterBar/utils/Filters'
import {
  DropdownFilterOptions,
  DropdownOption,
  EmissionsAndRecommendationResults,
  FilterOptions,
  FilterResultResponse,
  FiltersConfig,
  unknownOptionTypes,
} from '../../../../Types'
import {
  ALL_DROPDOWN_FILTER_OPTIONS,
  CLOUD_PROVIDER_OPTIONS,
} from '../../../../common/FilterBar/utils/DropdownConstants'
import { DropdownSelections } from '../../../../common/FilterBar/utils/FiltersUtil'
import { OptionChooser } from '../../../../common/FilterBar/utils/OptionChooser'
import { AccountChooser } from './options/AccountChooser'
import { CloudProviderChooser } from './options/CloudProviderChooser'
import { RegionChooser } from './options/RegionChooser'
import { RecommendationTypeChooser } from './options/RecommendationTypeChooser'

type ServiceDataOrRecommendationResult = (ServiceData | RecommendationResult)[]

const defaultConfig: FiltersConfig = {
  options: {
    [DropdownFilterOptions.ACCOUNTS]: [ALL_DROPDOWN_FILTER_OPTIONS.accounts],
    [DropdownFilterOptions.CLOUD_PROVIDERS]: CLOUD_PROVIDER_OPTIONS,
    [DropdownFilterOptions.REGIONS]: [ALL_DROPDOWN_FILTER_OPTIONS.regions],
    [DropdownFilterOptions.RECOMMENDATION_TYPES]: [
      ALL_DROPDOWN_FILTER_OPTIONS.recommendationTypes,
    ],
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
      case DropdownFilterOptions.CLOUD_PROVIDERS:
        return new CloudProviderChooser(
          selections,
          oldSelections,
          filterOptions,
        )
      case DropdownFilterOptions.REGIONS:
        return new RegionChooser(selections, oldSelections, filterOptions)
      case DropdownFilterOptions.RECOMMENDATION_TYPES:
        return new RecommendationTypeChooser(
          selections,
          oldSelections,
          filterOptions,
        )
    }
  }

  filter(
    rawResults: EmissionsAndRecommendationResults,
  ): EmissionsAndRecommendationResults {
    const finalFilterResults = { ...rawResults }

    const resultTypes = Object.keys(rawResults)
    resultTypes.forEach((resultType) => {
      let filteredResult = rawResults[resultType]

      filteredResult = this.getResultsFilteredBy(
        DropdownFilterOptions.ACCOUNTS,
        filteredResult,
      )

      if (resultType === 'recommendations') {
        filteredResult = this.getResultsFilteredBy(
          DropdownFilterOptions.RECOMMENDATION_TYPES,
          filteredResult,
        )
      }

      finalFilterResults[resultType] = this.getResultsFilteredBy(
        DropdownFilterOptions.REGIONS,
        filteredResult,
      )
    })

    return finalFilterResults
  }

  private getResultsFilteredBy(
    type: string,
    previousResults: ServiceDataOrRecommendationResult,
  ): ServiceDataOrRecommendationResult {
    const hasAllOptionsSelected = this.options[type].includes(
      ALL_DROPDOWN_FILTER_OPTIONS[type],
    )

    return previousResults.filter(
      (result) =>
        this.options[type].some((dropdownOption) =>
          this.isUnknownOrSameName(dropdownOption, type, result),
        ) || hasAllOptionsSelected,
    )
  }

  private isUnknownOrSameName(
    dropdownOption: DropdownOption,
    type: string,
    result: ServiceData | RecommendationResult,
  ) {
    const typeFilterOptionMap = {
      [DropdownFilterOptions.ACCOUNTS]: 'accountName',
      [DropdownFilterOptions.RECOMMENDATION_TYPES]: 'recommendationType',
      [DropdownFilterOptions.REGIONS]: 'region',
    }

    const name = typeFilterOptionMap[type]

    return (
      (dropdownOption.name.includes(unknownOptionTypes[type]) &&
        result[name] === null) ||
      dropdownOption.name === result[name]
    )
  }
}
