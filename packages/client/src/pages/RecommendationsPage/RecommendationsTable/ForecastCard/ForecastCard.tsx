/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import clsx from 'clsx'
import { Card, Divider, Typography } from '@material-ui/core'
import useStyles from './forecastCardStyles'
import PercentBadge from '../PercentBadge'

export type ForecastCardProps = {
  title: string
  co2eSavings: number | string
  costSavings: string
  co2ePercentChange?: number
  costPercentChange?: number
  useKilograms?: boolean
  id: string
}

const ForecastCard: FunctionComponent<ForecastCardProps> = ({
  title,
  co2eSavings,
  costSavings,
  co2ePercentChange,
  costPercentChange,
  useKilograms,
  id,
}) => {
  const classes = useStyles({ co2ePercentChange, costPercentChange })
  const hasCo2ePercentChange = co2ePercentChange !== undefined
  const hasCostPercentChange = costPercentChange !== undefined

  return (
    <Card data-testid={`forecast-card-${id}`} className={classes.card}>
      <div className={classes.titleContainer}>
        <Typography className={classes.title}>{title}</Typography>
      </div>
      <div
        className={clsx(classes.contentContainer, {
          [classes.contentWithBadge]:
            hasCo2ePercentChange && hasCostPercentChange,
        })}
      >
        <div className={classes.numberContainer}>
          <Typography
            data-testid={`co2e-savings-${id}`}
            className={clsx(classes.textContent, classes.co2eSavings)}
          >
            {co2eSavings}
          </Typography>
          <Typography
            className={classes.unitsText}
            data-testid={`unit-of-measure-${id}`}
          >
            {useKilograms ? 'Kilograms CO2e' : 'Metric Tons CO2e'}
          </Typography>
          {hasCo2ePercentChange && <PercentBadge amount={co2ePercentChange} />}
        </div>
        <Divider variant="middle" className={classes.divider} />
        <div className={classes.numberContainer}>
          <Typography
            data-testid={`cost-savings-${id}`}
            className={clsx(classes.textContent, classes.costSavings)}
          >
            {costSavings}
          </Typography>
          {hasCostPercentChange && (
            <PercentBadge
              data-testid={`cost-percent-change-${id}`}
              amount={costPercentChange}
            />
          )}
        </div>
      </div>
    </Card>
  )
}

export default ForecastCard
