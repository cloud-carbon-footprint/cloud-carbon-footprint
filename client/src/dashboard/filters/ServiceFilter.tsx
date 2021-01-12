/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { FunctionComponent } from 'react'
import { FilterProps } from './Filters'
import DropdownFilter, { DropdownOption } from './DropdownFilter'
import { ALL_SERVICES_DROPDOWN_OPTION, alphabetizeDropdownOptions } from './DropdownConstants'

const EMPTY_RESPONSE = { services: [{ key: '', name: '' }] }

export let SERVICE_OPTIONS: DropdownOption[]

const ServiceFilter: FunctionComponent<FilterProps> = ({ filters, setFilters, options }) => {
  let allDropdownServiceOptions: DropdownOption[] = []
  for (const service of (options ? options : EMPTY_RESPONSE).services) {
    allDropdownServiceOptions.push(service)
  }

  allDropdownServiceOptions = alphabetizeDropdownOptions(
    allDropdownServiceOptions,
  ).sort((firstDropdownServiceOption, secondDropdownServiceOption) =>
    firstDropdownServiceOption.cloudProvider!.localeCompare(secondDropdownServiceOption.cloudProvider!),
  )

  SERVICE_OPTIONS = [ALL_SERVICES_DROPDOWN_OPTION, ...allDropdownServiceOptions]

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
