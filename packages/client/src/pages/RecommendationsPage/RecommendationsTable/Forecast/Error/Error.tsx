import React, { FunctionComponent } from 'react'
import useStyles from './errorStyles'
import { Warning } from '@material-ui/icons'
import { Typography } from '@material-ui/core'

type ErrorProps = {
  errorType: string
}

const Error: FunctionComponent<ErrorProps> = ({ errorType }) => {
  const classes = useStyles()

  const errorMessages = {
    GROUPING:
      'In order to see a savings forecast that is relevant to you, please ensure your data is grouped by month, week, or day, and includes data from the past 30 days',
    RANGE:
      'In order to see a savings forecast that is relevant to you, please ensure you include data from the past 30 days',
    DAYS: 'It appears you are missing data for from the past 30 days. Please consider including the following dates for the most relevant forecast:',
  }

  return (
    <div
      className={classes.container}
      id="errorMessage"
      data-testid="forecast-error-message"
    >
      <Warning data-testid="warning-icon" className={classes.icon} />
      <Typography display="inline">{errorMessages[errorType]}</Typography>
    </div>
  )
}

export default Error
