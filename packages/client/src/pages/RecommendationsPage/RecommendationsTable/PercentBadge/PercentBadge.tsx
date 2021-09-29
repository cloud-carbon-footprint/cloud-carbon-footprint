/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { TrendingDown, TrendingUp, TrendingFlat } from '@material-ui/icons'
import { formattedNumberWithCommas } from 'utils/helpers/transformData'
import useStyles from './percentBadgeStyles'

type PercentBadgeProps = {
  amount: number
}

const PercentBadge: FunctionComponent<PercentBadgeProps> = ({ amount }) => {
  const classes = useStyles()

  const trendingArrowIcon = () => {
    if (amount > 0)
      return <TrendingDown data-testid="decrease-arrow" aria-label="decrease" />
    else if (amount === 0)
      return <TrendingFlat data-testid="flat-arrow" aria-label="no change" />
    return <TrendingUp data-testid="increase-arrow" aria-label="increase" />
  }

  return (
    <div
      className={clsx(classes.badgeContainer, {
        [classes.increasingBadge]: amount < 0,
        [classes.noChangeBadge]: amount === 0,
      })}
    >
      {trendingArrowIcon()}
      <Typography>{formattedNumberWithCommas(Math.abs(amount))}%</Typography>
    </div>
  )
}

export default PercentBadge
