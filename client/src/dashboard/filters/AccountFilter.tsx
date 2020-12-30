/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { FilterProps } from './Filters'
import DropdownFilter, { DropdownOption } from './DropdownFilter'
import { ALL_ACCOUNTS_DROPDOWN_OPTION } from './DropdownConstants'

const EMPTY_ACCOUNT = { cloudProvider: '', key: 'string', name: 'string' }
const EMPTY_RESPONSE = { accounts: [EMPTY_ACCOUNT] }

export let ACCOUNT_OPTIONS: DropdownOption[]
export let getAccountsFromSelections: (selections: string[]) => DropdownOption[]

const AccountFilter: FunctionComponent<FilterProps> = ({ filters, setFilters, options }) => {
  let allDropdownAccountOptions: DropdownOption[] = []
  for (const account of (options ? options : EMPTY_RESPONSE).accounts) {
    allDropdownAccountOptions.push(account)
  }
  allDropdownAccountOptions = allDropdownAccountOptions.sort(
    (firstDropdownAccountOption, secondDropdownAccountOption) =>
      firstDropdownAccountOption.cloudProvider!.localeCompare(secondDropdownAccountOption.cloudProvider!),
  )

  ACCOUNT_OPTIONS = [ALL_ACCOUNTS_DROPDOWN_OPTION, ...allDropdownAccountOptions]

  getAccountsFromSelections = (selections: string[]) => {
    return (options ? options : EMPTY_RESPONSE).accounts.filter((account) =>
      selections.some((selectionName) => account.key === selectionName),
    )
  }
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
