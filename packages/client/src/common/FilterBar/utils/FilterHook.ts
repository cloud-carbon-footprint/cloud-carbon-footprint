/*
 * © 2021 Thoughtworks, Inc.
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FilterResultResponse, FilterResults } from 'Types'
import { Filters } from './Filters'

export interface UseFiltersResults {
  filteredData: FilterResults
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

const useFilters = (
  data: FilterResults,
  buildFilters: (FilterResultResponse) => Filters,
  filteredResponse: FilterResultResponse,
): UseFiltersResults => {
  const [filteredData, setFilteredData] = useState(data)
  const [filters, setFilters] = useState(buildFilters(filteredResponse))

  useEffect(() => {
    setFilteredData(filters.filter(data))
  }, [data, setFilteredData, filters])

  useEffect(() => {
    setFilters(buildFilters(filteredResponse))
  }, [filteredResponse])

  return { filteredData, filters, setFilters }
}

export default useFilters
