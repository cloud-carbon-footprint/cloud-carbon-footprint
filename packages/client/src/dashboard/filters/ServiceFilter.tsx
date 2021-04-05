/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { FilterProps } from './Filters'
import DropdownFilter, { DropdownOption } from './DropdownFilter'
import {
  ALL_SERVICES_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
} from './DropdownConstants'

const EMPTY_RESPONSE = [{ key: '', name: '' }]

// TODO remove mutable global variable
export let SERVICE_OPTIONS: DropdownOption[]

const ServiceFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  const allDropdownServiceOptions = buildAndOrderDropdownOptions(
    options?.services,
    EMPTY_RESPONSE,
  )

  SERVICE_OPTIONS = [ALL_SERVICES_DROPDOWN_OPTION, ...allDropdownServiceOptions]

  return (
    <DropdownFilter
      id="services-filter"
      displayValue={filters.serviceLabel()}
      options={SERVICE_OPTIONS}
      selections={filters.services}
      selectionToOption={(service: DropdownOption) => service}
      updateSelections={(selections: DropdownOption[]) =>
        setFilters(filters.withServices(selections))
      }
    />
  )
}

export default ServiceFilter
