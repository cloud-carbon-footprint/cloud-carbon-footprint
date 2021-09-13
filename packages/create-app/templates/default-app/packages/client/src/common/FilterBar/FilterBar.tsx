/*
 * © 2021 Thoughtworks, Inc.
 */

import { Grid } from '@material-ui/core'
import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'
import useStyles from './filterBarStyles'
import { FilterOptions, FilterProps } from 'Types'
import { Filters } from './utils/Filters'

type FilterBarProps = {
  config: {
    filters: Filters
    setFilters: Dispatch<SetStateAction<Filters>>
    filterOptions: FilterOptions
  }
  components: FunctionComponent<FilterProps>[]
}

const FilterBar: FunctionComponent<FilterBarProps> = ({
  config,
  components,
}) => {
  const classes = useStyles()
  return (
    <div data-testid="filterBar" className={classes.filterHeader}>
      <Grid item xs={12}>
        <div className={classes.filterContainer}>
          <div className={classes.filterContainerSection}>
            {components.map((FilterComponent, i) => (
              <div key={i} className={classes.filter}>
                <FilterComponent
                  filters={config.filters}
                  setFilters={config.setFilters}
                  options={config.filterOptions}
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
