/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
// /*
//  * © 2021 Thoughtworks, Inc.
//  */

import React, { FunctionComponent } from 'react'
import FilterDropdown from '../../common/FilterDropdown'
import { DropdownFilterOptions, DropdownOption, FilterProps } from '../../Types'

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

/*
 * © 2021 Thoughtworks, Inc.
 */

// import React, { FunctionComponent, useState } from 'react'
// import { DropdownFilterOptions, FilterProps } from '../../Types'
// import SelectDropdown from '../../common/SelectDropdown'

// const AccountFilter: FunctionComponent<FilterProps> = ({
//   filters,
//   setFilters,
//   options,
// }) => {
//   const [accountType, setAccountType] = useState()
//   const stringAccountOptions: string[] = options.accounts.map((account) => {
//     return account.name
//   })

//   const accountOptions = options.accounts
//   return (
//     <SelectDropdown
//       id="accounts-filter"
//       value={filters.label(accountOptions, DropdownFilterOptions.ACCOUNTS)}
//       dropdownOptions={stringAccountOptions}
//       handleChange={(event) => {
//         console.log(event)
//       }}
//     />
//   )
// }

// export default AccountFilter
