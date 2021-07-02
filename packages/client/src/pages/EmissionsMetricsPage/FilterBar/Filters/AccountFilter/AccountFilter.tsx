/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { FilterProps } from '../../utils/Filters'
import DropdownFilter from '../DropdownFilter'

import { DropdownOption } from 'Types'

// // TODO remove mutable global variable
// export let ACCOUNT_OPTIONS: DropdownOption[]

const AccountFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const accountOptions = options.accounts
  return (
    <DropdownFilter
      id="accounts-filter"
      displayValue={filters.accountLabel(accountOptions)}
      options={accountOptions}
      selections={filters.accounts}
      selectionToOption={(account) => account}
      updateSelections={(selections: DropdownOption[]) => {
        setFilters(filters.withAccounts(selections, accountOptions))
      }}
    />
  )
}

export default AccountFilter
