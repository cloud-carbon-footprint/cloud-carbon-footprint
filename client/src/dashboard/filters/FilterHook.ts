/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { EstimationResult, FilterResultResponse } from '../../models/types'
import { Filters, filtersConfigGenerator } from './Filters'
const useFilters = (data: EstimationResult[], filteredResponse: FilterResultResponse): UseFiltersResults => {
  const [filteredData, setFilteredData] = useState(data)
  const [filters, setFilters] = useState(new Filters(filtersConfigGenerator(filteredResponse)))

  useEffect(() => {
    setFilteredData(filters.filter(data))
  }, [data, setFilteredData, filters])

  useEffect(() => {
    setFilters(new Filters(filtersConfigGenerator(filteredResponse)))
  }, [filteredResponse])

  return { filteredData, filters, setFilters }
}

export interface UseFiltersResults {
  filteredData: EstimationResult[]
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

export default useFilters
