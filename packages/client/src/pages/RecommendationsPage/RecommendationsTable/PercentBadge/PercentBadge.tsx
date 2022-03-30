/*
 * © 2021 Thoughtworks, Inc.
 */

import { FunctionComponent } from 'react'
import clsx from 'clsx'
import { Typography } from '@material-ui/core'
import { TrendingDown, TrendingFlat, TrendingUp } from '@material-ui/icons'
import { formattedNumberWithCommas } from '../../../../utils/helpers/transformData'
import useStyles from './percentBadgeStyles'

type PercentBadgeProps = {
  amount?: number
}

const PercentBadge: FunctionComponent<PercentBadgeProps> = ({ amount }) => {
  const classes = useStyles()

  const trendingArrowIcon = () => {
    if (amount < 0)
      return <TrendingUp data-testid="increase-arrow" aria-label="increase" />
    if (amount === 0)
      return <TrendingFlat data-testid="flat-arrow" aria-label="no change" />
    return <TrendingDown data-testid="decrease-arrow" aria-label="decrease" />
  }

  const badgeLabel: string =
    amount || amount == 0
      ? `${formattedNumberWithCommas(Math.abs(amount))}%`
      : '-'

  const containerClass = clsx(classes.badgeContainer, {
    [classes.increasingBadge]: amount < 0,
    [classes.noChangeBadge]: amount === 0,
  })

  return (
    <div className={containerClass}>
      {trendingArrowIcon()}
      <Typography data-testid="percentage-badge-label">{badgeLabel}</Typography>
    </div>
  )
}

export default PercentBadge
