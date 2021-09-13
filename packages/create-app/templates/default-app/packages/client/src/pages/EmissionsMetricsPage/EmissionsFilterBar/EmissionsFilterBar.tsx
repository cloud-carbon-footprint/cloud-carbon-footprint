/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { DropdownOption, FilterBarProps, FilterOptions } from 'Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
  CLOUD_PROVIDER_OPTIONS,
} from 'common/FilterBar/utils/DropdownConstants'
import FilterBar from 'common/FilterBar'
import {
  AccountFilter,
  CloudProviderFilter,
  DateFilter,
  MonthFilter,
  ServiceFilter,
} from './Filters'

const EmissionsFilterBar: FunctionComponent<FilterBarProps> = ({
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

    return {
      accounts: accountOptions,
      services: serviceOptions,
      cloudProviders: CLOUD_PROVIDER_OPTIONS,
    }
  }

  const filterComponents = [
    CloudProviderFilter,
    AccountFilter,
    ServiceFilter,
    DateFilter,
    MonthFilter,
  ]
  const filterConfig = {
    filters,
    setFilters,
    filterOptions: getFilterOptions(),
  }

  return <FilterBar config={filterConfig} components={filterComponents} />
}

export default EmissionsFilterBar
