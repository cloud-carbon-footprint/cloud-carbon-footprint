/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import clsx from 'clsx'
import { Box, Card, CardContent, Grid, Typography } from '@material-ui/core'
import useStyles from './DashboardCardStyles'

type DashboardCardProps = {
  title?: string
  isHalf?: boolean
  noPadding?: boolean
  testId?: string
  containerClass?: string
  children: ReactElement
}

const DashboardCard: FunctionComponent<DashboardCardProps> = ({
  title,
  isHalf,
  noPadding,
  testId,
  containerClass,
  children,
}) => {
  const classes = useStyles()

  return (
    <Grid
      item
      xs={isHalf ? false : 12}
      className={clsx({
        [classes.cardHalf]: isHalf,
        [containerClass]: containerClass,
      })}
      data-testid={testId}
    >
      <Card
        className={clsx(classes.card, {
          [classes.minHeight]: isHalf,
        })}
      >
        <Box className={classes.contentContainer} padding={noPadding ? 0 : 3}>
          {title && <Typography className={classes.title}>{title}</Typography>}
          <CardContent className={classes.cardContent}>{children}</CardContent>
        </Box>
      </Card>
    </Grid>
  )
}

export default DashboardCard
