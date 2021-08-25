/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { Button, ButtonGroup } from '@material-ui/core'
import { FilterProps } from 'Types'
import useStyles from './monthFilterStyles'

const MonthFilter: FunctionComponent<FilterProps> = ({
  filters,
  setFilters,
}) => {
  const classes = useStyles()
  const timeframes: { [label: string]: number } = {
    '1M': 1,
    '3M': 3,
    '6M': 6,
    '12M': 12,
    All: 36,
  }

  const isCurrentTimeFrame = (time: number): boolean => {
    if (time > 12) return filters.timeframe > 12
    return filters.timeframe === time
  }

  return (
    <>
      <ButtonGroup className={classes.buttonGroup}>
        {Object.keys(timeframes).map((label) => {
          const time = timeframes[label]
          return (
            <Button
              disableElevation
              key={label}
              variant={isCurrentTimeFrame(time) ? 'contained' : undefined}
              color={isCurrentTimeFrame(time) ? 'primary' : 'default'}
              onClick={() => setFilters(filters.withTimeFrame(time))}
              className={classes.button}
            >
              {label}
            </Button>
          )
        })}
      </ButtonGroup>
    </>
  )
}

export default MonthFilter
