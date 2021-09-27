/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import moment from 'moment'
import { Typography } from '@material-ui/core'
import { useRemoteService } from 'utils/hooks'
import { sumEstimate, sumRecommendations } from 'utils/helpers'
import ForecastCard from '../ForecastCard/ForecastCard'
import useStyles from './forecastStyles'
import { RecommendationResult } from '@cloud-carbon-footprint/common'

type ForecastProps = {
  recommendations: RecommendationResult[]
}

const Forecast: FunctionComponent<ForecastProps> = ({
  recommendations,
}): ReactElement => {
  const classes = useStyles()
  const endDate: moment.Moment = moment.utc()
  const startDate = moment.utc().subtract('1', 'year')
  const { data, loading } = useRemoteService([], startDate, endDate)

  const sumCurrentCo2e = sumEstimate(data, 'co2e')
  const sumCurrentCost = sumEstimate(data, 'cost')
  const currentCostFormatted = `$${parseFloat(sumCurrentCost.toFixed(2))}`

  const sumSavingsCo2e = sumRecommendations(recommendations, 'co2eSavings')
  const sumSavingsCost = sumRecommendations(recommendations, 'costSavings')

  const projectedSavingsCo2e = sumCurrentCo2e - sumSavingsCo2e
  const projectedSavingsCost = sumCurrentCost - sumSavingsCost
  const projectedCostFormatted = `$${parseFloat(
    projectedSavingsCost.toFixed(2),
  )}`

  return (
    <div>
      <Typography className={classes.title}>Forecast</Typography>

      <ForecastCard
        title={'Current'}
        co2eSavings={loading ? '-' : sumCurrentCo2e}
        costSavings={loading ? '-' : currentCostFormatted}
      />

      <ForecastCard
        title={'Projected'}
        co2eSavings={projectedSavingsCo2e}
        costSavings={projectedCostFormatted}
      />
    </div>
  )
}

export default Forecast
