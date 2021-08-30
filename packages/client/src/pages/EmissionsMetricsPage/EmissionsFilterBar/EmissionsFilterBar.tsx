/*
 * © 2021 Thoughtworks, Inc.
 */

import React, {
  Dispatch,
  FunctionComponent,
  ReactElement,
  SetStateAction,
} from 'react'
import { DropdownOption, FilterOptions, FilterResultResponse } from 'Types'
import { Filters } from '../../../common/FilterBar/utils/Filters'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
} from '../../../common/FilterBar/utils/DropdownConstants'
import FilterBar from 'common/FilterBar'
import {
  AccountFilter,
  CloudProviderFilter,
  DateFilter,
  MonthFilter,
  ServiceFilter,
} from './Filters'

type EmissionsFilterBarProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  filteredDataResults: FilterResultResponse
}

const EmissionsFilterBar: FunctionComponent<EmissionsFilterBarProps> = ({
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

    const allServiceDropdownOptions = buildAndOrderDropdownOptions(
      filteredDataResults?.services,
      [{ key: '', name: '' }],
    )
    const serviceOptions: DropdownOption[] = [
      ALL_SERVICES_DROPDOWN_OPTION,
      ...allServiceDropdownOptions,
    ]

    return { accounts: accountOptions, services: serviceOptions }
  }

  const primaryComponents = [CloudProviderFilter, AccountFilter, ServiceFilter]
  const optionalComponents = [DateFilter, MonthFilter]
  const filterConfig = {
    filters,
    setFilters,
    filterOptions: getFilterOptions(),
  }

  return (
    <FilterBar
      config={filterConfig}
      primaryComponents={primaryComponents}
      optionalComponents={optionalComponents}
    />
  )
}

export default EmissionsFilterBar
