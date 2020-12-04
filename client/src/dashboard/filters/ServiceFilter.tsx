/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { SERVICE_OPTIONS } from '../services'
import { FilterProps } from './Filters'
import DropdownFilter, { DropdownOption } from './DropdownFilter'

const ServiceFilter: FunctionComponent<FilterProps> = ({ filters, setFilters }) => {
  return (
    <DropdownFilter
      id="services-filter"
      displayValue={filters.serviceLabel()}
      options={SERVICE_OPTIONS}
      selections={filters.services}
      selectionToOption={(service: DropdownOption) => service}
      updateSelections={(selections: DropdownOption[]) => setFilters(filters.withServices(selections))}
    />
  )
}

export default ServiceFilter
