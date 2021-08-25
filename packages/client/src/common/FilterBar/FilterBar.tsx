/*
 * © 2021 Thoughtworks, Inc.
 */

import { Grid } from '@material-ui/core'
import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'
import useStyles from './filterBarStyles'
import { FilterOptions, FilterProps } from 'Types'
import { Filters } from '../../pages/EmissionsMetricsPage/EmissionsFilterBar/utils/Filters'

type FilterBarProps = {
  config: {
    filters: Filters
    setFilters: Dispatch<SetStateAction<Filters>>
    filterOptions: FilterOptions
  }
  primaryComponents: FunctionComponent<FilterProps>[]
  optionalComponents?: FunctionComponent<FilterProps>[]
}

const FilterBar: FunctionComponent<FilterBarProps> = ({
  config,
  primaryComponents,
  optionalComponents,
}) => {
  const classes = useStyles()
  return (
    <div data-testid="filterBar" className={classes.filterHeader}>
      <Grid item xs={12}>
        <div className={classes.filterContainer}>
          <div className={classes.filterContainerSection}>
            {primaryComponents.map((FilterComponent, i) => (
              <div key={i} className={classes.filter}>
                <FilterComponent
                  filters={config.filters}
                  setFilters={config.setFilters}
                  options={config.filterOptions}
                />
              </div>
            ))}
          </div>
          {optionalComponents && (
            <div className={classes.filterContainerSection}>
              {optionalComponents.map((FilterComponent, i) => (
                <div key={i} className={classes.filter}>
                  <FilterComponent
                    filters={config.filters}
                    setFilters={config.setFilters}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Grid>
    </div>
  )
}

export default FilterBar
