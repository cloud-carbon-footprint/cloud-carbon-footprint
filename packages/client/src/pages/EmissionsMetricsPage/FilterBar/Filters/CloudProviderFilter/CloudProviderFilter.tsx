/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { CLOUD_PROVIDER_OPTIONS } from '../../utils/DropdownConstants'
import { FilterProps } from '../../utils/Filters'
import DropdownFilter from '../DropdownFilter'
import { DropdownOption } from 'Types'

const CloudProviderFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
}) => {
  return (
    <DropdownFilter
      id="cloud-provider-filter"
      displayValue={filters.cloudProviderLabel()}
      options={CLOUD_PROVIDER_OPTIONS}
      selections={filters.cloudProviders}
      selectionToOption={(cloudProvider: DropdownOption) => cloudProvider}
      updateSelections={(selections: DropdownOption[]) =>
        setFilters(filters.withCloudProviders(selections))
      }
    />
  )
}

export default CloudProviderFilter
