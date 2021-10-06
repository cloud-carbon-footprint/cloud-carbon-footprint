/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import clsx from 'clsx'
import { CardContent, Grid, Typography } from '@material-ui/core'
import DashboardCard from 'layout/DashboardCard'
import useStyles from './noDataMessageStyles'
import shruggingCloud from './V1Shrugging-cloud-icon.svg'
import emptyStateIcon from './V1Empty-state-generic-icon.svg'

type NoDataMessageProps = {
  isTop?: boolean
  isBold?: boolean
  isHalf?: boolean
  title?: string
  boldTitle?: string
}

const NoDataMessage: FunctionComponent<NoDataMessageProps> = ({
  isTop,
  isBold,
  isHalf,
  title,
  boldTitle,
}): ReactElement => {
  const classes = useStyles()
  const containerClass = clsx({ [classes.largeMessage]: isBold })

  return (
    <DashboardCard
      isHalf={isHalf}
      title={title}
      testId="no-data-message"
      noPadding={!!boldTitle}
      containerClass={containerClass}
    >
      <>
        {boldTitle && (
          <CardContent className={classes.boldTitleContainer}>
            <Typography className={classes.boldTitle} variant="h4" gutterBottom>
              {boldTitle}
            </Typography>
          </CardContent>
        )}
        <div className={clsx(classes.root, { [classes.boldRoot]: boldTitle })}>
          <Grid container>
            <Grid item xs={12}>
              <img
                src={isTop ? shruggingCloud : emptyStateIcon}
                alt="No Data Icon"
              />
              <div className={classes.addSpacing}>
                There's no data to display!
              </div>
              <div>Expand your search parameters to get started.</div>
              {isTop && (
                <div className={classes.smallText}>
                  (Try adding accounts, services or expanding the date range)
                </div>
              )}
            </Grid>
          </Grid>
        </div>
      </>
    </DashboardCard>
  )
}

export default NoDataMessage
