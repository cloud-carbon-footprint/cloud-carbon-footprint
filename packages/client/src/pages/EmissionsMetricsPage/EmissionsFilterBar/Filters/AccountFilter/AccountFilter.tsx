/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import DropdownFilter from '../DropdownFilter'
import { DropdownFilterOptions, DropdownOption, FilterProps } from 'Types'

const AccountFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const accountOptions = options.accounts
  return (
    <DropdownFilter
      id="accounts-filter"
      displayValue={filters.label(filters.accounts, accountOptions, 'Accounts')}
      options={accountOptions}
      selections={filters.accounts}
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
