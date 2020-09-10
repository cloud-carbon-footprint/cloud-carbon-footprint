import React, { Dispatch, FunctionComponent, SetStateAction } from 'react'
import { Button, ButtonGroup } from '@material-ui/core'
import { Filters } from './hooks/Filters'

const MonthFilter: FunctionComponent<MonthFilterProps> = ({ filters, setFilters }) => {
  return (
    <>
      <ButtonGroup>
        <Button
          disableElevation
          variant={filters.timeframe === 1 ? 'contained' : undefined}
          color={filters.timeframe === 1 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(1))}
        >
          1M
        </Button>
        <Button
          disableElevation
          variant={filters.timeframe === 3 ? 'contained' : undefined}
          color={filters.timeframe === 3 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(3))}
        >
          3M
        </Button>
        <Button
          disableElevation
          variant={filters.timeframe === 6 ? 'contained' : undefined}
          color={filters.timeframe === 6 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(6))}
        >
          6M
        </Button>
        <Button
          disableElevation
          variant={filters.timeframe === 12 ? 'contained' : undefined}
          color={filters.timeframe === 12 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(12))}
        >
          12M
        </Button>
      </ButtonGroup>
    </>
  )
}

type MonthFilterProps = {
  filters: Filters
  setFilters: Dispatch<SetStateAction<Filters>>
}

export default MonthFilter
