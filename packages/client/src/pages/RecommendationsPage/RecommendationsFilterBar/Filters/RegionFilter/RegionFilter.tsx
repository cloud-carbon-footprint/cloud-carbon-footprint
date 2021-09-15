/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import FilterDropdown from 'common/FilterDropdown'
import { DropdownFilterOptions, DropdownOption, FilterProps } from 'Types'

const RegionFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const regionOptions = options.regions
  return (
    <FilterDropdown
      id="regions-filter"
      displayValue={filters.label(regionOptions, DropdownFilterOptions.REGIONS)}
      options={regionOptions}
      selections={filters.options.regions}
      selectionToOption={(region) => region}
      updateSelections={(selections: DropdownOption[]) => {
        setFilters(
          filters.withDropdownOption(
            selections,
            options,
            DropdownFilterOptions.REGIONS,
          ),
        )
      }}
    />
  )
}

export default RegionFilter
