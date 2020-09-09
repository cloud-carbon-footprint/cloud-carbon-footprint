import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import moment from 'moment'
import { EstimationResult } from '../types'

interface FiltersConfig {
  timeframe: number
}
const defaultFiltersConfig = {
  timeframe: 12,
}
export class Filters {
  readonly timeframe: number

  constructor(config: FiltersConfig = defaultFiltersConfig) {
    this.timeframe = config.timeframe
  }

  withTimeFrame(timeframe: number): Filters {
    return this.timeframe === timeframe ? this : new Filters({ ...this, timeframe })
  }

  filter(results: EstimationResult[]) {
    const today: moment.Moment = moment.utc()
    const todayMinusXMonths: moment.Moment = today.clone().subtract(this.timeframe, 'M')

    return results.filter((estimationResult: EstimationResult) =>
      moment.utc(estimationResult.timestamp).isBetween(todayMinusXMonths, today, 'day', '[]'),
    )
  }
}

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
