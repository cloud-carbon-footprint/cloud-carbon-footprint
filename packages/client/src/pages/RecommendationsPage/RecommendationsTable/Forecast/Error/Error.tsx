import React, { FunctionComponent } from 'react'

type ErrorProps = {
  errorType: string
}

const Error: FunctionComponent<ErrorProps> = ({ errorType }) => {
  const errorMessages = {
    GROUPING:
      'In order to see a savings forecast that is relevant to you, please ensure your data is grouped by month, week, or day, and includes data from the past 30 days',
    RANGE:
      'In order to see a savings forecast that is relevant to you, please ensure you include data from the past 30 days',
    DAYS: 'It appears you are missing data for from the past 30 days. Please consider including the following dates for the most relevant forecast:',
  }

  return (
    <div id="errorMessage" data-testid="forecast-error-message">
      <p>{errorMessages[errorType]}</p>
    </div>
  )
}

export default Error
