/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import clsx from 'clsx'
import { Card, Grid } from '@material-ui/core'
import DashboardCard from 'layout/DashboardCard'
import useStyles from './noDataMessageStyles'
import shruggingCloud from './V1Shrugging-cloud-icon.svg'
import emptyStateIcon from './V1Empty-state-generic-icon.svg'

type NoDataMessageProps = {
  isTop?: boolean
  isBold?: boolean
  title?: string
}

const NoDataMessage: FunctionComponent<NoDataMessageProps> = ({
  isTop,
  isBold,
  title,
}): ReactElement => {
  const classes = useStyles()
  const containerClass = clsx({ [classes.largeMessage]: isBold })
  return (
    <DashboardCard
      title={title}
      testId="no-data-message"
      containerClass={containerClass}
    >
      <Card className={classes.root}>
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
      </Card>
    </DashboardCard>
  )
}

export default NoDataMessage
