/*
 * © 2021 Thoughtworks, Inc.
 */

import React from 'react'
import moment from 'moment'
import { Typography } from '@material-ui/core'
import LoadingMessage from 'common/LoadingMessage'
import { useRemoteService } from 'utils/hooks'
import { sumEstimate } from 'utils/helpers'
import ForecastCard from '../ForecastCard/ForecastCard'
import useStyles from './forecastStyles'

const Forecast = (): JSX.Element => {
  const endDate: moment.Moment = moment.utc()
  const startDate = moment.utc().subtract('1', 'year')
  const { data, loading } = useRemoteService([], startDate, endDate)

  const sumCo2e = sumEstimate(data, 'co2e')
  const sumCost = sumEstimate(data, 'cost')
  const costFormatted = `$${parseFloat(sumCost.toFixed(2))}`

  const classes = useStyles()

  if (loading) {
    return (
      <div>
        <Typography className={classes.title}>Forecast</Typography>
        <LoadingMessage
          message={'Loading cloud data. This may take a while...'}
        />
      </div>
    )
  }

  return (
    <div>
      <Typography className={classes.title}>Forecast</Typography>

      <ForecastCard
        title={'Current'}
        co2eSavings={sumCo2e}
        costSavings={costFormatted}
      />
    </div>
  )
}

export default Forecast
