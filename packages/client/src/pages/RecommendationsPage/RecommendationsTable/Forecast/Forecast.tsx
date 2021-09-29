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
import {
  calculatePercentChange,
  formattedNumberWithCommas,
} from 'utils/helpers/transformData'
import ForecastEquivalencyCard from '../ForecastEquivalencyCard/ForecastEquivalencyCard'
import clsx from 'clsx'

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

  let yearlyCostSavings = '-'
  let treeSeedlings = '-'

  if (!loading) {
    const sumCurrentCo2e = sumEstimate(data, 'co2e')
    const sumCurrentCost = sumEstimate(data, 'cost')

    currentCo2eFormatted = sumCurrentCo2e.toFixed(2)
    currentCostFormatted = `$${sumCurrentCost.toFixed(2)}`

    const sumSavingsCo2e = sumRecommendations(recommendations, 'co2eSavings')
    const sumSavingsCost = sumRecommendations(recommendations, 'costSavings')

    const projectedSavingsCo2e = sumCurrentCo2e - sumSavingsCo2e
    const projectedSavingsCost = sumCurrentCost - sumSavingsCost

    projectedCo2eFormatted = formattedNumberWithCommas(projectedSavingsCo2e)
    projectedCostFormatted = `$${formattedNumberWithCommas(
      projectedSavingsCost,
    )}`

    co2ePercentChange = calculatePercentChange(
      sumCurrentCo2e,
      projectedSavingsCo2e,
    )
    costPercentChange = calculatePercentChange(
      sumCurrentCost,
      projectedSavingsCost,
    )

    yearlyCostSavings = `$${formattedNumberWithCommas(sumSavingsCost * 12)}`

    treeSeedlings = formattedNumberWithCommas(sumSavingsCo2e * 16.5337915448, 0)
  }

  return (
    <>
      <Typography className={classes.title}>Forecast</Typography>
      <div className={classes.forecastContainer}>
        <ForecastCard
          title={'Current Total'}
          isLoading={loading}
          co2eSavings={currentCo2eFormatted}
          costSavings={currentCostFormatted}
        />
        <ForwardIcon className={classes.icon} />
        <ForecastCard
          title={'Projected Total'}
          isLoading={loading}
          co2eSavings={projectedCo2eFormatted}
          costSavings={projectedCostFormatted}
          co2ePercentChange={co2ePercentChange}
          costPercentChange={costPercentChange}
        />
        <div className={clsx(classes.icon, classes.equalSign)}>=</div>
        <ForecastEquivalencyCard
          title={'Savings equal to'}
          treeSeedlings={treeSeedlings}
          yearCostSavings={yearlyCostSavings}
          isLoading={loading}
        />
      </div>
    </>
  )
}

export default Forecast
