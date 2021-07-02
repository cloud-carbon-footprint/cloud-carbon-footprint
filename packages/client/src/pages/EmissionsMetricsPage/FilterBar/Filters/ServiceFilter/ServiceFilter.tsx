/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent } from 'react'
import DropdownFilter from '../DropdownFilter'
import { FilterProps } from '../../utils/Filters'
import {
  ALL_SERVICES_DROPDOWN_OPTION,
  buildAndOrderDropdownOptions,
} from '../../utils/DropdownConstants'
import { DropdownOption } from 'Types'

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
        setFilters(filters.withServices(selections, options.accounts))
      }
    />
  )
}

export default ServiceFilter
