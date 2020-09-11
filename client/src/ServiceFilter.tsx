import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { SERVICE_LABELS, SERVICE_OPTIONS } from './services'
import { Filters } from './hooks/Filters'
import DropdownFilter from './DropdownFilter'

type ServiceFilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

const ServiceFilter: FunctionComponent<ServiceFilterProps> = ({ filters, setFilters }) => {
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
