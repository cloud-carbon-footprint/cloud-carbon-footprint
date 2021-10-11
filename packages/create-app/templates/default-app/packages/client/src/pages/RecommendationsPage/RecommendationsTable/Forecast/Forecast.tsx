/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import ForwardIcon from '@material-ui/icons/Forward'
import {
  RecommendationResult,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import useStyles from './forecastStyles'
import {
  sumEstimate,
  sumRecommendations,
  calculatePercentChange,
  formattedNumberWithCommas,
} from 'utils/helpers'
import ForecastCard from '../ForecastCard'
import ForecastEquivalencyCard from '../ForecastEquivalencyCard'

type ForecastProps = {
  emissionsData: ServiceData[]
  recommendations: RecommendationResult[]
}

const Forecast: FunctionComponent<ForecastProps> = ({
  emissionsData,
  recommendations,
}): ReactElement => {
  const classes = useStyles()

  const sumCurrentCo2e = sumEstimate(emissionsData, 'co2e')
  const sumCurrentCost = sumEstimate(emissionsData, 'cost')

  const currentCo2eFormatted = formattedNumberWithCommas(sumCurrentCo2e)
  const currentCostFormatted = `$${formattedNumberWithCommas(sumCurrentCost)}`

  const sumSavingsCo2e = sumRecommendations(recommendations, 'co2eSavings')
  const sumSavingsCost = sumRecommendations(recommendations, 'costSavings')

  const projectedSavingsCo2e = sumCurrentCo2e - sumSavingsCo2e
  const projectedSavingsCost = sumCurrentCost - sumSavingsCost

  const projectedCo2eFormatted = formattedNumberWithCommas(projectedSavingsCo2e)
  const projectedCostFormatted = `$${formattedNumberWithCommas(
    projectedSavingsCost,
  )}`

  const co2ePercentChange = calculatePercentChange(
    sumCurrentCo2e,
    projectedSavingsCo2e,
  )
  const costPercentChange = calculatePercentChange(
    sumCurrentCost,
    projectedSavingsCost,
  )

  const monthlyCostSavings = `$${formattedNumberWithCommas(sumSavingsCost)}`

  const treeSeedlings = formattedNumberWithCommas(
    sumSavingsCo2e * 16.5337915448,
    0,
  )

  return (
    <>
      <Typography className={classes.title}>Forecast</Typography>
      <div className={classes.forecastContainer}>
        <ForecastCard
          title="Last 30 Day Total"
          co2eSavings={currentCo2eFormatted}
          costSavings={currentCostFormatted}
        />
        <ForwardIcon className={classes.icon} />
        <ForecastCard
          title="Projected 30 Day Total"
          co2eSavings={projectedCo2eFormatted}
          costSavings={projectedCostFormatted}
          co2ePercentChange={co2ePercentChange}
          costPercentChange={costPercentChange}
        />
        <div className={clsx(classes.icon, classes.equalSign)}>=</div>
        <ForecastEquivalencyCard
          title="Monthly Savings Equal To"
          treeSeedlings={treeSeedlings}
          yearCostSavings={monthlyCostSavings}
        />
      </div>
    </>
  )
}

export default Forecast
