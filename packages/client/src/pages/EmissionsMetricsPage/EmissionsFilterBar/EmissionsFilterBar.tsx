/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement, useMemo } from 'react'
import { DropdownOption, FilterBarProps, FilterOptions } from '../../../Types'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
  CLOUD_PROVIDER_OPTIONS,
} from '../../../common/FilterBar/utils/DropdownConstants'
import FilterBar from '../../../common/FilterBar'
import {
  AccountFilter,
  CloudProviderFilter,
  DateFilter,
  MonthFilter,
  ServiceFilter,
} from './Filters'

const filterComponents = [
  CloudProviderFilter,
  AccountFilter,
  ServiceFilter,
  DateFilter,
  MonthFilter,
]

const EmissionsFilterBar: FunctionComponent<FilterBarProps> = ({
  filters,
  setFilters,
  filterOptions,
}): ReactElement => {
  const memoizedFilterOptions: FilterOptions = useMemo(() => {
    const allAccountDropdownOptions = buildAndOrderDropdownOptions(
      filterOptions?.accounts,
      [{ cloudProvider: '', key: 'string', name: 'string' }],
    )
    const accountOptions: DropdownOption[] = [
      ALL_ACCOUNTS_DROPDOWN_OPTION,
      ...allAccountDropdownOptions,
    ]

    const allServiceDropdownOptions = buildAndOrderDropdownOptions(
      filterOptions?.services,
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
  }, [filterOptions?.accounts, filterOptions?.services])

  const filterConfig = useMemo(
    () => ({
      filters,
      setFilters,
      filterOptions: memoizedFilterOptions,
    }),
    [filters, setFilters, memoizedFilterOptions],
  )

  return <FilterBar config={filterConfig} components={filterComponents} />
}

export default EmissionsFilterBar
