/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent, ReactElement } from 'react'
import { Typography } from '@material-ui/core'
import moment from 'moment'

type DateRangeProps = {
  lookBackPeriodDays: number
}

const DateRange: FunctionComponent<DateRangeProps> = ({
  lookBackPeriodDays,
}): ReactElement => {
  const today = moment().utc()
  const todayFormatted = today.format('ll')
  const lookBackDateFormatted = today
    .subtract(lookBackPeriodDays, 'days')
    .format('ll')

  return (
    <Typography data-testid="dateRange">{`${lookBackDateFormatted} - ${todayFormatted}`}</Typography>
  )
}

export default DateRange
