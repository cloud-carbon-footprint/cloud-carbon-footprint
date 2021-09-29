/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import { Card, Typography } from '@material-ui/core'
import { Eco, CalendarToday } from '@material-ui/icons'
import useStyles from './forecastEquivalencyCardStyles'
import clsx from 'clsx'

type ForecastEquivalencyProps = {
  title: string
  treeSeedlings: string
  yearCostSavings: string
  isLoading: boolean
}

const ForecastEquivalencyCard: FunctionComponent<ForecastEquivalencyProps> = ({
  title,
  treeSeedlings,
  yearCostSavings,
  isLoading,
}) => {
  const classes = useStyles()
  return (
    <Card data-testid="forecast-equivalency-card" className={classes.card}>
      <div className={classes.titleContainer}>
        <Typography className={classes.title}>{title}</Typography>
      </div>
      <div className={classes.contentContainer}>
        <div className={classes.contentItemsContainer}>
          <Eco className={classes.treeSeedlingsIcon} />
          <Typography
            className={clsx(classes.textContent, {
              [classes.loadingNumber]: isLoading,
            })}
          >
            {treeSeedlings}
          </Typography>
          <Typography>Tree seedlings grown</Typography>
        </div>
        <div className={classes.contentItemsContainer}>
          <CalendarToday className={classes.calendarIcon} />
          <Typography
            className={clsx(classes.textContent, {
              [classes.loadingNumber]: isLoading,
            })}
          >
            {yearCostSavings}
          </Typography>
          <Typography>Per year</Typography>
        </div>
      </div>
    </Card>
  )
}

export default ForecastEquivalencyCard
