import React, { FunctionComponent } from 'react'
import { Button, ButtonGroup } from '@material-ui/core'
import { FilterProps } from './Filters'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  buttonGroup: {
    height: theme.spacing(5),
    backgroundColor: theme.palette.background.paper,
  },
  button: {
    transition: 'color 1s',
  },
}))

const MonthFilter: FunctionComponent<FilterProps> = ({ filters, setFilters }) => {
  const classes = useStyles()
  return (
    <>
      <ButtonGroup className={classes.buttonGroup}>
        <Button
          disableElevation
          variant={filters.timeframe === 1 ? 'contained' : undefined}
          color={filters.timeframe === 1 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(1))}
          className={classes.button}
        >
          1M
        </Button>
        <Button
          disableElevation
          variant={filters.timeframe === 3 ? 'contained' : undefined}
          color={filters.timeframe === 3 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(3))}
          className={classes.button}
        >
          3M
        </Button>
        <Button
          disableElevation
          variant={filters.timeframe === 6 ? 'contained' : undefined}
          color={filters.timeframe === 6 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(6))}
          className={classes.button}
        >
          6M
        </Button>
        <Button
          disableElevation
          variant={filters.timeframe === 12 ? 'contained' : undefined}
          color={filters.timeframe === 12 ? 'primary' : 'default'}
          onClick={() => setFilters(filters.withTimeFrame(12))}
          className={classes.button}
        >
          12M
        </Button>
      </ButtonGroup>
    </>
  )
}

export default MonthFilter
