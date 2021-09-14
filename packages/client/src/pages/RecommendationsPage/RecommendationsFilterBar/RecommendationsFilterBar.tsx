/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { DropdownOption, FilterBarProps, FilterOptions } from 'Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
import FilterBar from 'common/FilterBar'
import AccountFilter from 'common/AccountFilter'
import CloudProviderFilter from 'common/CloudProviderFilter'

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

    return { accounts: accountOptions, cloudProviders: CLOUD_PROVIDER_OPTIONS }
  }

  const filterComponents = [CloudProviderFilter, AccountFilter]

  const filterConfig = {
    filters,
    setFilters,
    filterOptions: getFilterOptions(),
  }

  return <FilterBar config={filterConfig} components={filterComponents} />
}

export default RecommendationsFilterBar
