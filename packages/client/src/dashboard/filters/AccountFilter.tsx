/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { FilterProps } from './Filters'
import DropdownFilter, { DropdownOption } from './DropdownFilter'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
} from './DropdownConstants'

const EMPTY_RESPONSE = [{ cloudProvider: '', key: 'string', name: 'string' }]

// TODO remove mutable global variable
export let ACCOUNT_OPTIONS: DropdownOption[]

const AccountFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const allDropdownAccountOptions = buildAndOrderDropdownOptions(
    options?.accounts,
    EMPTY_RESPONSE,
  )
  ACCOUNT_OPTIONS = [ALL_ACCOUNTS_DROPDOWN_OPTION, ...allDropdownAccountOptions]

  return (
    <DropdownFilter
      id="accounts-filter"
      displayValue={filters.accountLabel()}
      options={ACCOUNT_OPTIONS}
      selections={filters.accounts}
      selectionToOption={(account) => account}
      updateSelections={(selections: DropdownOption[]) => {
        setFilters(filters.withAccounts(selections))
      }}
    />
  )
}

export default AccountFilter
