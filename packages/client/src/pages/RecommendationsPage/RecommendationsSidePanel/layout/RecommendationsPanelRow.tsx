/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Grid, Typography } from '@material-ui/core'
import useStyles from '../recommendationsSidePanelStyles'

type RecommendationsPanelRowProps = {
  label: string
  content: string
}

const RecommendationsPanelRow: FunctionComponent<RecommendationsPanelRowProps> =
  ({ label, content }): ReactElement => {
    const classes = useStyles()
    return (
      <Grid
        container
        justify="space-between"
        spacing={2}
        className={classes.content}
      >
        <Grid item>
          <Typography className={classes.smallLabel} component="p">
            {label}
          </Typography>
        </Grid>
        <Grid item>
          <Typography className={classes.smallText} component="p">
            {content}
          </Typography>
        </Grid>
      </Grid>
    )
  }

export default RecommendationsPanelRow
