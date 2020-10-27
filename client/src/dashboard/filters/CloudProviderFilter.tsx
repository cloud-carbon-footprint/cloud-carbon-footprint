import React, { FunctionComponent } from 'react'
import { CLOUD_PROVIDER_LABELS, CLOUD_PROVIDER_OPTIONS } from '../cloudProviders'
import { FilterProps } from './Filters'
import DropdownFilter from './DropdownFilter'

const CloudProviderFilter: FunctionComponent<FilterProps> = ({ filters, setFilters }) => {
  return (
    <DropdownFilter
      id="cloud-provider-filter"
      displayValue={filters.cloudProviderLabel()}
      options={CLOUD_PROVIDER_OPTIONS}
      selections={filters.cloudProviders}
      selectionToOption={(cloudProvider: string) => ({
        key: cloudProvider,
        name: CLOUD_PROVIDER_LABELS[cloudProvider],
      })}
      updateSelections={(selections: string[]) => setFilters(filters.withCloudProviders(selections))}
    />
  )
}

export default CloudProviderFilter
