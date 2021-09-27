/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { TrendingDown, TrendingUp } from '@material-ui/icons'
import useStyles from './percentBadgeStyles'

type PercentBadgeProps = {
  amount: number
}

const PercentBadge: FunctionComponent<PercentBadgeProps> = ({ amount }) => {
  const classes = useStyles()
  const arrowIcon =
    amount >= 0 ? (
      <TrendingDown data-testid="decrease-arrow" aria-label="decrease" />
    ) : (
      <TrendingUp data-testid="increase-arrow" aria-label="increase" />
    )

  return (
    <div
      className={clsx(classes.badgeContainer, {
        [classes.increasingBadge]: amount < 0,
      })}
    >
      {arrowIcon}
      <Typography>{Math.abs(amount)}%</Typography>
    </div>
  )
}

export default PercentBadge
