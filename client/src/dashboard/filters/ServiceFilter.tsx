/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { SERVICE_LABELS, SERVICE_OPTIONS } from '../services'
import { FilterProps } from './Filters'
import DropdownFilter from './DropdownFilter'

const ServiceFilter: FunctionComponent<FilterProps> = ({ filters, setFilters }) => {
  return (
    <DropdownFilter
      id="services-filter"
      displayValue={filters.serviceLabel()}
      options={SERVICE_OPTIONS}
      selections={filters.services}
      selectionToOption={(service: string) => ({
        key: service,
        name: SERVICE_LABELS[service],
      })}
      updateSelections={(selections: string[]) => setFilters(filters.withServices(selections))}
    />
  )
}

export default ServiceFilter
