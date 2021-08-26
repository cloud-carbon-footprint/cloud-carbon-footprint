/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import DropdownFilter from '../DropdownFilter'
import { DropdownFilterOptions, DropdownOption, FilterProps } from 'Types'

const ServiceFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const serviceOptions = options.services
  return (
    <DropdownFilter
      id="services-filter"
      displayValue={filters.serviceLabel(serviceOptions)}
      options={serviceOptions}
      selections={filters.services}
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
