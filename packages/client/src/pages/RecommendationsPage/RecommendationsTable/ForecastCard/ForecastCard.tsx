/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import { Card, Divider, Typography } from '@material-ui/core'
import useStyles from './forecastCardStyles'
import clsx from 'clsx'

type ForecastCardProps = {
  title: string
  co2eSavings: number
  costSavings: string
}

const ForecastCard: FunctionComponent<ForecastCardProps> = ({
  title,
  co2eSavings,
  costSavings,
}) => {
  const classes = useStyles()
  return (
    <Card data-testid="forecast-card" className={classes.card}>
      <div className={classes.titleContainer}>
        <Typography className={classes.title}>{title}</Typography>
      </div>
      <div className={classes.contentContainer}>
        <div>
          <Typography
            className={clsx(classes.textContent, classes.co2eSavings)}
          >
            {co2eSavings}
          </Typography>
          <Typography className={classes.unitsText}>
            Metric Tons CO2e
          </Typography>
        </div>
        <Divider variant="middle" className={classes.divider} />
        <Typography className={clsx(classes.textContent, classes.costSavings)}>
          {costSavings}
        </Typography>
      </div>
    </Card>
  )
}

export default ForecastCard
