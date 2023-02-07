/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import clsx from 'clsx'
import { Moment } from 'moment'
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core'
import ForwardIcon from '@material-ui/icons/Forward'
import ExpandMore from '@material-ui/icons/ExpandMore'
import {
  GroupBy,
  RecommendationResult,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import useStyles from './forecastStyles'
import ForecastCard from '../ForecastCard'
import ForecastEquivalencyCard from '../ForecastEquivalencyCard'
import {
  sumEstimates,
  sumRecommendations,
  calculatePercentChange,
  formattedNumberWithCommas,
} from '../../../../utils/helpers'
import { Co2eUnit } from '../../../../Types'
import { co2eUnitMultiplier } from '../../../../utils/helpers/units'
import { checkIfAllDatesExistForForecast } from '../../../../utils/helpers/handleDates'

export type ForecastProps = {
  emissionsData: ServiceData[]
  recommendations: RecommendationResult[]
  co2eUnit: Co2eUnit
  forecastDetails: ForecastDetails
}

export type ForecastDetails = {
  missingDates: Moment[]
  groupBy: GroupBy
}

const Forecast: FunctionComponent<ForecastProps> = ({
  emissionsData,
  recommendations,
  co2eUnit,
  forecastDetails,
}): ReactElement => {
  const classes = useStyles()

  const forecastMultiplier = co2eUnitMultiplier[co2eUnit]

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

  const { missingDates, groupBy } = forecastDetails
  const allDatesExistForForecast = checkIfAllDatesExistForForecast({
    missingDates,
    groupBy,
  })
  const sortedMissingDates = missingDates.sort((a, b) => {
    return a.valueOf() - b.valueOf()
  })

  let errorMessage
  const errorMessages = {
    a: 'In order to see a savings forecast that is relevant to you, please ensure your data is grouped by month, week, or day, and includes data from the past 30 days',
    b: 'In order to see a savings forecast that is relevant to you, please ensure you include data from the past 30 days',
    c: 'It appears you are missing data for from the past 30 days. Please consider including the following dates for the most relevant forecast:',
  }

  if (groupBy === 'quarter' || groupBy === 'year') {
    errorMessage = errorMessages['a']
  } else if (missingDates.length > 0 && allDatesExistForForecast) {
    errorMessage = errorMessages['b']
  }

  return (
    <>
      <Typography className={classes.title}>Forecast</Typography>
      {errorMessage ? (
        <div id="errorMessage" data-testid="forecast-error-message">
          <p>{errorMessage}</p>
        </div>
      ) : (
        <div className={classes.forecastContainer}>
          <ForecastCard
            title="Last 30 Day Total"
            co2eSavings={currentCo2eFormatted}
            costSavings={currentCostFormatted}
            co2eUnit={co2eUnit}
            id="last-thirty-day-total"
          />
          <ForwardIcon className={classes.icon} />
          <ForecastCard
            title="Projected 30 Day Total"
            co2eSavings={projectedCo2eFormatted}
            costSavings={projectedCostFormatted}
            co2ePercentChange={co2ePercentChange}
            costPercentChange={costPercentChange}
            co2eUnit={co2eUnit}
            id="projected-thirty-day-total"
          />
          <div className={clsx(classes.icon, classes.equalSign)}>=</div>
          <ForecastEquivalencyCard
            title="Monthly Savings Equal To"
            treeSeedlings={treeSeedlings}
            yearCostSavings={monthlyCostSavings}
          />
          {missingDates.length > 0 && (
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography>{errorMessages['c']}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  <ul>
                    {sortedMissingDates.map((date, i) => (
                      <li key={i}>{date.format('LL').toString()}</li>
                    ))}
                  </ul>
                </Typography>
              </AccordionDetails>
            </Accordion>
          )}
        </div>
      )}
    </>
  )
}

export default Forecast
