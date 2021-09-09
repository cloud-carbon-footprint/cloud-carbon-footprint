/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import FilterDropdown from 'common/FilterDropdown'
import { DropdownFilterOptions, DropdownOption, FilterProps } from 'Types'

const AccountFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const accountOptions = options.accounts
  return (
    <FilterDropdown
      id="accounts-filter"
      displayValue={filters.label(
        accountOptions,
        DropdownFilterOptions.ACCOUNTS,
      )}
      options={accountOptions}
      selections={filters.options.accounts}
      selectionToOption={(account) => account}
      updateSelections={(selections: DropdownOption[]) => {
        setFilters(
          filters.withDropdownOption(
            selections,
            options,
            DropdownFilterOptions.ACCOUNTS,
          ),
        )
      }}
    />
  )
}

export default AccountFilter
