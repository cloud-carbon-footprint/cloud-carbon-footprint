/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { DropdownOption, FilterBarProps, FilterOptions } from 'Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_RECOMMENDATION_TYPES_DROPDOWN_OPTION,
  ALL_REGIONS_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
import FilterBar from 'common/FilterBar'
import AccountFilter from 'common/AccountFilter'
import CloudProviderFilter from 'common/CloudProviderFilter'
import RegionFilter from './Filters/RegionFilter'
import RecommendationTypeFilter from './Filters/RecommendationType'

const RecommendationsFilterBar: FunctionComponent<FilterBarProps> = ({
  filters,
  setFilters,
  filteredDataResults,
}): ReactElement => {
  const getFilterOptions = (): FilterOptions => {
    const allAccountDropdownOptions = buildAndOrderDropdownOptions(
      filteredDataResults?.accounts,
      [{ cloudProvider: '', key: 'string', name: 'string' }],
    )

    const accountOptions: DropdownOption[] = [
      ALL_ACCOUNTS_DROPDOWN_OPTION,
      ...allAccountDropdownOptions,
    ]

    const allRegionDropdownOptions = buildAndOrderDropdownOptions(
      filteredDataResults?.regions,
      [{ cloudProvider: '', key: 'string', name: 'string' }],
    )

    const regionOptions: DropdownOption[] = [
      ALL_REGIONS_DROPDOWN_OPTION,
      ...allRegionDropdownOptions,
    ]

    const allRecommendationTypeOptions = buildAndOrderDropdownOptions(
      filteredDataResults?.recommendationTypes,
      [{ cloudProvider: '', key: 'string', name: 'string' }],
    )

    const recommendationTypeOptions: DropdownOption[] = [
      ALL_RECOMMENDATION_TYPES_DROPDOWN_OPTION,
      ...allRecommendationTypeOptions,
    ]

    return {
      accounts: accountOptions,
      cloudProviders: CLOUD_PROVIDER_OPTIONS,
      regions: regionOptions,
      recommendationTypes: recommendationTypeOptions,
    }
  }

  const filterComponents = [
    CloudProviderFilter,
    AccountFilter,
    RegionFilter,
    RecommendationTypeFilter,
  ]

  const filterConfig = {
    filters,
    setFilters,
    filterOptions: getFilterOptions(),
  }

  return <FilterBar config={filterConfig} components={filterComponents} />
}

export default RecommendationsFilterBar
