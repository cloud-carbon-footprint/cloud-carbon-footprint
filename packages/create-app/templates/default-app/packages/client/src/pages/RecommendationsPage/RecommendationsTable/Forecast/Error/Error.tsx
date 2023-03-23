import React, { FunctionComponent } from 'react'
import { Warning } from '@material-ui/icons'
import { Typography } from '@material-ui/core'
import useStyles from './errorStyles'
import { ForecastErrorType } from '../Forecast'
import clsx from 'clsx'

type ErrorProps = {
  errorType: ForecastErrorType
  hasContainer?: boolean
}

type ErrorMessages = {
  [key in ForecastErrorType]: string
}

const Error: FunctionComponent<ErrorProps> = ({ errorType, hasContainer }) => {
  const classes = useStyles()
  const containerClasses = clsx(classes.container, {
    [classes.noContainer]: hasContainer,
  })

  const errorMessages: ErrorMessages = {
    GROUPING:
      'In order to see a relevant savings forecast, please ensure your data is grouped by month, week, or day, and includes data from the past 30 days',
    RANGE:
      'In order to see a relevant savings forecast, please adjust your date range to include data from the past 30 days',
    DAYS: 'It appears you are missing data from the past 30 days. Please consider including the following dates for the most accurate forecast:',
  }

  return (
    <div
      className={containerClasses}
      id="errorMessage"
      data-testid="forecast-error-message"
    >
      <Warning data-testid="warning-icon" className={classes.icon} />
      <Typography display="inline">{errorMessages[errorType]}</Typography>
    </div>
  )
}

export default Error
