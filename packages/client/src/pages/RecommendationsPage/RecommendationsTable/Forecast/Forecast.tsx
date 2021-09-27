/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import moment from 'moment'
import { Typography } from '@material-ui/core'
import ForwardIcon from '@material-ui/icons/Forward'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { useRemoteService } from 'utils/hooks'
import { sumEstimate, sumRecommendations } from 'utils/helpers'
import ForecastCard from '../ForecastCard/ForecastCard'
import useStyles from './forecastStyles'
import { calculatePercentChange } from '../../../../utils/helpers/transformData'

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

  let currentCo2eFormatted = '-'
  let currentCostFormatted = '-'

  let projectedCo2eFormatted = '-'
  let projectedCostFormatted = '-'

  let co2ePercentChange
  let costPercentChange

  if (!loading) {
    const sumCurrentCo2e = sumEstimate(data, 'co2e')
    const sumCurrentCost = sumEstimate(data, 'cost')

    currentCo2eFormatted = sumCurrentCo2e.toFixed(2)
    currentCostFormatted = `$${sumCurrentCost.toFixed(2)}`

    const sumSavingsCo2e = sumRecommendations(recommendations, 'co2eSavings')
    const sumSavingsCost = sumRecommendations(recommendations, 'costSavings')

    const projectedSavingsCo2e = sumCurrentCo2e - sumSavingsCo2e
    const projectedSavingsCost = sumCurrentCost - sumSavingsCost

    projectedCo2eFormatted = projectedSavingsCo2e.toFixed(2)
    projectedCostFormatted = `$${projectedSavingsCost.toFixed(2)}`

    co2ePercentChange = calculatePercentChange(sumCurrentCo2e, sumSavingsCo2e)
    costPercentChange = calculatePercentChange(sumCurrentCost, sumSavingsCost)
  }

  return (
    <>
      <Typography className={classes.title}>Forecast</Typography>
      <div className={classes.forecastContainer}>
        <ForecastCard
          title={'Current'}
          co2eSavings={currentCo2eFormatted}
          costSavings={currentCostFormatted}
        />
        <ForwardIcon className={classes.forwardIcon} />
        <ForecastCard
          title={'Projected'}
          co2eSavings={projectedCo2eFormatted}
          costSavings={projectedCostFormatted}
          co2ePercentChange={co2ePercentChange}
          costPercentChange={costPercentChange}
        />
      </div>
    </>
  )
}

export default Forecast
