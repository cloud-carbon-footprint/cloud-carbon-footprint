/*
 * © 2021 Thoughtworks, Inc.
 */

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { FilterResultResponse, FilterResults } from '../../../Types'
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
  isDataLoaded?: boolean,
): UseFiltersResults => {
  const [filteredData, setFilteredData] = useState(data)
  const [filters, setFilters] = useState(buildFilters(filteredResponse))

  /*
    TODO: Clean up Recommendations dependency check.
    UseEffect should only have data.recommendations as dependency if used by Recs Page.
    Otherwise, it will throw errors.
   */
  useEffect(() => {
    setFilteredData(filters.filter(data))
  }, [setFilteredData, filters, isDataLoaded])

  useEffect(() => {
    setFilters(buildFilters(filteredResponse))
  }, [filteredResponse])

  return { filteredData, filters, setFilters }
}

export default useFilters
