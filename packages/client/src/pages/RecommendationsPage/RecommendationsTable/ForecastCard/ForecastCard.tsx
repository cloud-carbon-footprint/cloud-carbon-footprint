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
}

const ForecastCard: FunctionComponent<ForecastCardProps> = ({
  title,
  co2eSavings,
  costSavings,
  co2ePercentChange,
  costPercentChange,
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
            className={clsx(classes.textContent, classes.co2eSavings)}
          >
            {co2eSavings}
          </Typography>
          <Typography className={classes.unitsText}>
            Metric Tons CO2e
          </Typography>
          {co2ePercentChange && <PercentBadge amount={co2ePercentChange} />}
        </div>
        <Divider variant="middle" className={classes.divider} />
        <div className={classes.numberContainer}>
          <Typography
            className={clsx(classes.textContent, classes.costSavings)}
          >
            {costSavings}
          </Typography>
          {costPercentChange && <PercentBadge amount={costPercentChange} />}
        </div>
      </div>
    </Card>
  )
}

export default ForecastCard
