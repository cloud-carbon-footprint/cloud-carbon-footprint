/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import FilterBar from '../../../common/FilterBar'
import { DropdownOption, FilterBarProps, FilterOptions } from 'Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
} from '../../../common/FilterBar/utils/DropdownConstants'

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

    return { accounts: accountOptions }
  }

  const filterConfig = {
    filters,
    setFilters,
    filterOptions: getFilterOptions(),
  }

  return <FilterBar components={[]} config={filterConfig} />
}

export default RecommendationsFilterBar
