/*
 * © 2021 Thoughtworks, Inc.
 */

import React, {
  Dispatch,
  FunctionComponent,
  ReactElement,
  SetStateAction,
} from 'react'
import { Grid } from '@material-ui/core'
import { DropdownOption, FilterOptions, FilterResultResponse } from 'Types'
import {
  AccountFilter,
  CloudProviderFilter,
  DateFilter,
  MonthFilter,
  ServiceFilter,
} from './Filters'
import useStyles from './filterBarStyles'
import { Filters } from './utils/Filters'
import {
  ALL_ACCOUNTS_DROPDOWN_OPTION,
  ALL_SERVICES_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
} from './utils/DropdownConstants'

type FilterBarProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
  filteredDataResults: FilterResultResponse
}

const FilterBar: FunctionComponent<FilterBarProps> = ({
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

  const filterOptions = getFilterOptions()

  const classes = useStyles()

  return (
    <div data-testid="filterBar" className={classes.filterHeader}>
      <Grid item xs={12}>
        <div className={classes.filterContainer}>
          <div className={classes.filterContainerSection}>
            {[CloudProviderFilter, AccountFilter, ServiceFilter].map(
              (FilterComponent, i) => (
                <div key={i} className={classes.filter}>
                  <FilterComponent
                    filters={filters}
                    setFilters={setFilters}
                    options={filterOptions}
                  />
                </div>
              ),
            )}
          </div>
          <div className={classes.filterContainerSection}>
            {[DateFilter, MonthFilter].map((FilterComponent, i) => (
              <div key={i} className={classes.filter}>
                <FilterComponent filters={filters} setFilters={setFilters} />
              </div>
            ))}
          </div>
        </div>
      </Grid>
    </div>
  )
}

export default FilterBar
