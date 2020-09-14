import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { EstimationResult } from '../../types'
import { Filters } from './Filters'

const useFilters = (data: EstimationResult[]) => {
  const [filteredData, setFilteredData] = useState(data)
  const [filters, setFilters] = useState(new Filters())

  useEffect(() => {
    setFilteredData(filters.filter(data))
  }, [data, setFilteredData, filters])

  return { filteredData, filters, setFilters }
}

export interface UseFiltersResults {
  filteredData: EstimationResult[]
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

export default useFilters
