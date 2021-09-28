/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import { Card, Divider, Typography } from '@material-ui/core'
import useStyles from './forecastCardStyles'
import clsx from 'clsx'
import PercentBadge from '../PercentBadge/PercentBadge'

export type ForecastCardProps = {
  title: string
  co2eSavings: number | string
  costSavings: string
  co2ePercentChange?: number
  costPercentChange?: number
  isLoading?: boolean
}

const ForecastCard: FunctionComponent<ForecastCardProps> = ({
  title,
  co2eSavings,
  costSavings,
  co2ePercentChange,
  costPercentChange,
  isLoading,
}) => {
  const classes = useStyles({ co2ePercentChange, costPercentChange })
  return (
    <Card data-testid="forecast-card" className={classes.card}>
      <div className={classes.titleContainer}>
        <Typography className={classes.title}>{title}</Typography>
      </div>
      <div className={classes.contentContainer}>
        <div className={classes.numberContainer}>
          <Typography
            className={clsx(classes.textContent, classes.co2eSavings, {
              [classes.loadingNumber]: isLoading,
            })}
          >
            {co2eSavings}
          </Typography>
          <Typography className={classes.unitsText}>
            Metric Tons CO2e
          </Typography>
          {(co2ePercentChange || co2ePercentChange === 0) && (
            <PercentBadge amount={co2ePercentChange} />
          )}
        </div>
        <Divider variant="middle" className={classes.divider} />
        <div className={classes.numberContainer}>
          <Typography
            className={clsx(classes.textContent, classes.costSavings, {
              [classes.loadingNumber]: isLoading,
            })}
          >
            {costSavings}
          </Typography>
          {(costPercentChange || costPercentChange === 0) && (
            <PercentBadge amount={costPercentChange} />
          )}
        </div>
      </div>
    </Card>
  )
}

export default ForecastCard
