/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { CLOUD_PROVIDER_OPTIONS } from '../../../../../common/FilterBar/utils/DropdownConstants'
import DropdownFilter from '../DropdownFilter'
import { DropdownFilterOptions, DropdownOption, FilterProps } from 'Types'

const CloudProviderFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
  options,
}) => {
  return (
    <DropdownFilter
      id="cloud-provider-filter"
      displayValue={filters.label(
        CLOUD_PROVIDER_OPTIONS,
        DropdownFilterOptions.CLOUD_PROVIDERS,
      )}
      options={CLOUD_PROVIDER_OPTIONS}
      selections={filters.options.cloudProviders}
      selectionToOption={(cloudProvider: DropdownOption) => cloudProvider}
      updateSelections={(selections: DropdownOption[]) =>
        setFilters(
          filters.withDropdownOption(
            selections,
            options,
            DropdownFilterOptions.CLOUD_PROVIDERS,
          ),
        )
      }
    />
  )
}

export default CloudProviderFilter
