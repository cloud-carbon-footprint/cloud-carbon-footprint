/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { Typography } from '@material-ui/core'
import moment from 'moment'
import useStyles from './dateRangeStyles'

type DateRangeProps = {
  lookBackPeriodDays: number
}

const DateRange: FunctionComponent<DateRangeProps> = ({
  lookBackPeriodDays,
}): ReactElement => {
  const classes = useStyles()
  const today = moment().utc()
  const todayFormatted = today.format('ll')
  const lookBackDateFormatted = today
    .subtract(lookBackPeriodDays, 'days')
    .format('ll')

  return (
    <Typography
      data-testid="dateRange"
      className={classes.dateRangeText}
    >{`${lookBackDateFormatted} - ${todayFormatted}`}</Typography>
  )
}

export default DateRange
