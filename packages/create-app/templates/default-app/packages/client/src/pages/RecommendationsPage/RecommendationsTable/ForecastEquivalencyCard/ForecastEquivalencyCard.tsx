/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import { Card, Typography } from '@material-ui/core'
import { Eco, CalendarToday } from '@material-ui/icons'
import useStyles from './forecastEquivalencyCardStyles'

type ForecastEquivalencyProps = {
  title: string
  treeSeedlings: string
  yearCostSavings: string
}

const ForecastEquivalencyCard: FunctionComponent<ForecastEquivalencyProps> = ({
  title,
  treeSeedlings,
  yearCostSavings,
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
            className={classes.textContent}
            data-testid="tree-seedlings-grown"
          >
            {treeSeedlings}
          </Typography>
          <Typography>Tree seedlings grown</Typography>
        </div>
        <div className={classes.contentItemsContainer}>
          <CalendarToday className={classes.calendarIcon} />
          <Typography
            className={classes.textContent}
            data-testid="cost-savings-per-month"
          >
            {yearCostSavings}
          </Typography>
          <Typography>Dollars per month</Typography>
        </div>
      </div>
    </Card>
  )
}

export default ForecastEquivalencyCard
