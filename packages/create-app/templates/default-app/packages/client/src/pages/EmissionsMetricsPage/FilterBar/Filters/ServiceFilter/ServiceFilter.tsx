/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import DropdownFilter from '../DropdownFilter'
import { FilterProps } from '../../utils/Filters'
import { DropdownOption } from 'Types'

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
        setFilters(filters.withServices(selections, options))
      }
    />
  )
}

export default ServiceFilter
