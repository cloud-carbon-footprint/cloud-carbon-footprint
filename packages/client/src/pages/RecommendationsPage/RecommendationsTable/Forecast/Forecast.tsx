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
  sumEstimates,
  sumRecommendations,
  calculatePercentChange,
  formattedNumberWithCommas,
} from '../../../../utils/helpers'
import ForecastCard from '../ForecastCard'
import ForecastEquivalencyCard from '../ForecastEquivalencyCard'

export type ForecastProps = {
  emissionsData: ServiceData[]
  recommendations: RecommendationResult[]
  useKilograms: boolean
}

const Forecast: FunctionComponent<ForecastProps> = ({
  emissionsData,
  recommendations,
  useKilograms,
}): ReactElement => {
  const classes = useStyles()

  const forecastMultiplier = useKilograms ? 1000 : 1

  const sumCurrentCo2e = sumEstimates(emissionsData, 'co2e')
  const sumCurrentCost = sumEstimates(emissionsData, 'cost')

  const currentCo2eFormatted = formattedNumberWithCommas(
    sumCurrentCo2e * forecastMultiplier,
  )
  const currentCostFormatted = `$${formattedNumberWithCommas(sumCurrentCost)}`

  const sumSavingsCo2e = sumRecommendations(recommendations, 'co2eSavings')
  const sumSavingsCost = sumRecommendations(recommendations, 'costSavings')

  const projectedSavingsCo2e = sumCurrentCo2e - sumSavingsCo2e
  const projectedSavingsCost = sumCurrentCost - sumSavingsCost

  const formatProjectedSavings = (projectedSavings: number): string =>
    projectedSavings > 0 ? formattedNumberWithCommas(projectedSavings) : '0'

  const projectedCo2eFormatted = formatProjectedSavings(
    projectedSavingsCo2e * forecastMultiplier,
  )

  const projectedCostFormatted = `$${formatProjectedSavings(
    projectedSavingsCost,
  )}`

  const getPercentChange = (oldAmount: number, newAmount: number): number =>
    newAmount > 0 ? calculatePercentChange(oldAmount, newAmount) : null

  const co2ePercentChange = getPercentChange(
    sumCurrentCo2e,
    projectedSavingsCo2e,
  )
  const costPercentChange = getPercentChange(
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
          useKilograms={useKilograms}
          id="last-thirty-day-total"
        />
        <ForwardIcon className={classes.icon} />
        <ForecastCard
          title="Projected 30 Day Total"
          co2eSavings={projectedCo2eFormatted}
          costSavings={projectedCostFormatted}
          co2ePercentChange={co2ePercentChange}
          costPercentChange={costPercentChange}
          useKilograms={useKilograms}
          id="projected-thirty-day-total"
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
