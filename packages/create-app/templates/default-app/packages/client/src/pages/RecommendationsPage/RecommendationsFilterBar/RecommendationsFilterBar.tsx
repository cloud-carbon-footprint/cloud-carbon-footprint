/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement, useCallback } from 'react'
import {
  Co2eUnit,
  DropdownOption,
  FilterBarProps,
  FilterOptions,
} from '../../../Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_RECOMMENDATION_TYPES_DROPDOWN_OPTION,
  ALL_REGIONS_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
  CLOUD_PROVIDER_OPTIONS,
} from '../../../common/FilterBar/utils/DropdownConstants'
import FilterBar from '../../../common/FilterBar'
import AccountFilter from '../../../common/AccountFilter'
import CloudProviderFilter from '../../../common/CloudProviderFilter'
import RegionFilter from './Filters/RegionFilter'
import RecommendationTypeFilter from './Filters/RecommendationType'
import Toggle from '../../../common/Toggle'

const RecommendationsFilterBar: FunctionComponent<FilterBarProps> = ({
  filters,
  setFilters,
  filterOptions,
  setCo2eUnit,
}): ReactElement => {
  const getFilterOptions = (): FilterOptions => {
    const allAccountDropdownOptions = buildAndOrderDropdownOptions(
      filterOptions?.accounts,
      [{ cloudProvider: '', key: 'string', name: 'string' }],
    )

    const accountOptions: DropdownOption[] = [
      ALL_ACCOUNTS_DROPDOWN_OPTION,
      ...allAccountDropdownOptions,
    ]

    const allRegionDropdownOptions = buildAndOrderDropdownOptions(
      filterOptions?.regions,
      [{ cloudProvider: '', key: 'string', name: 'string' }],
    )

    const regionOptions: DropdownOption[] = [
      ALL_REGIONS_DROPDOWN_OPTION,
      ...allRegionDropdownOptions,
    ]

    const allRecommendationTypeOptions = buildAndOrderDropdownOptions(
      filterOptions?.recommendationTypes,
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

  const toggleUnit = useCallback(
    (useKilograms: boolean) => {
      setCo2eUnit(useKilograms ? Co2eUnit.Kilograms : Co2eUnit.MetricTonnes)
    },
    [setCo2eUnit],
  )

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

  const suffixComponents = (
    <Toggle label="CO2e Units" handleToggle={toggleUnit} />
  )

  return (
    <FilterBar
      config={filterConfig}
      components={filterComponents}
      suffixComponent={suffixComponents}
    />
  )
}

export default RecommendationsFilterBar
