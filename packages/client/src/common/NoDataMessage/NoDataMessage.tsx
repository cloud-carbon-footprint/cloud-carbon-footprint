/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Box, Card, Grid } from '@material-ui/core'
import useStyles from './noDataMessageStyles'
import shruggingCloud from './V1Shrugging-cloud-icon.svg'
import emptyStateIcon from './V1Empty-state-generic-icon.svg'

type NoDataMessageProps = {
  isTop?: boolean
}

const NoDataMessage: FunctionComponent<NoDataMessageProps> = ({
  isTop,
}): ReactElement => {
  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <Box data-testid="no-data-message">
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
      </Box>
    </Card>
  )
}

export default NoDataMessage
