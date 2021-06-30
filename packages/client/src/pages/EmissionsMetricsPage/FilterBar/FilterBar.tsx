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
import { FilterResultResponse } from 'Types'
import CloudProviderFilter from './Filters/CloudProviderFilter'
import {
  AccountFilter,
  DateFilter,
  MonthFilter,
  ServiceFilter,
} from './Filters'
import useStyles from './filterBarStyles'
import { Filters } from './utils/Filters'

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
                    options={filteredDataResults}
                  />
                </div>
              ),
            )}
          </div>
          <div className={classes.filterContainerSection}>
            {[DateFilter, MonthFilter].map((FilterComponent, i) => (
              <div key={i} className={classes.filter}>
                <FilterComponent
                  filters={filters}
                  setFilters={setFilters}
                  options={filteredDataResults}
                />
              </div>
            ))}
          </div>
        </div>
      </Grid>
    </div>
  )
}

export default FilterBar
