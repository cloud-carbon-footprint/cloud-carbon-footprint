/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { FilterProps } from '../../utils/Filters'
import DropdownFilter from '../DropdownFilter'
import { DropdownOption } from 'Types'

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
        setFilters(filters.withAccounts(selections, options))
      }}
    />
  )
}

export default AccountFilter
