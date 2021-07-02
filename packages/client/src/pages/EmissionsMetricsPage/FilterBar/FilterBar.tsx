/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, {
  Dispatch,
  FunctionComponent,
  ReactElement,
  SetStateAction,
} from 'react'
import { Grid } from '@material-ui/core'
import { DropdownOption, FilterResultResponse } from 'Types'
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
  const allAccountDropdownOptions = buildAndOrderDropdownOptions(
    filteredDataResults?.accounts,
    [{ cloudProvider: '', key: 'string', name: 'string' }],
  )
  const accountOptions: DropdownOption[] = [
    ALL_ACCOUNTS_DROPDOWN_OPTION,
    ...allAccountDropdownOptions,
  ]

  const filterOptions = {
    accounts: accountOptions,
    services: filteredDataResults.services,
  }

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
