/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import FilterDropdown from 'common/FilterDropdown'
import { DropdownFilterOptions, DropdownOption, FilterProps } from 'Types'

const ServiceFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const serviceOptions = options.services
  return (
    <FilterDropdown
      id="services-filter"
      displayValue={filters.label(
        serviceOptions,
        DropdownFilterOptions.SERVICES,
      )}
      options={serviceOptions}
      selections={filters.options.services}
      selectionToOption={(service: DropdownOption) => service}
      updateSelections={(selections: DropdownOption[]) =>
        setFilters(
          filters.withDropdownOption(
            selections,
            options,
            DropdownFilterOptions.SERVICES,
          ),
        )
      }
    />
  )
}

export default ServiceFilter
