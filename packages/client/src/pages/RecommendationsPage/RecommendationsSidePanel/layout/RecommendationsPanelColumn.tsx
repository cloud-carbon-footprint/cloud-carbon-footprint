/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent } from 'react'
import { Grid, Typography } from '@material-ui/core'
import useStyles from '../recommendationsSidePanelStyles'

type RecommendationsPanelColumnProps = {
  label: string
  content: string | number
  subLabel?: string
  hasLeftAlignedContent?: boolean
}

const RecommendationsPanelColumn: FunctionComponent<RecommendationsPanelColumnProps> =
  ({ label, content, subLabel, hasLeftAlignedContent }) => {
    const classes = useStyles()
    return (
      <Grid
        className={classes.detailsColumn}
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <Grid item>
          <Typography className={classes.contentLabel} component="p">
            {label}
          </Typography>
        </Grid>
        {subLabel && (
          <Grid item>
            <Typography className={classes.subLabel} component="p">
              {subLabel}
            </Typography>
          </Grid>
        )}
        <Grid item>
          <Typography
            component="p"
            align={hasLeftAlignedContent ? 'left' : 'center'}
          >
            {content}
          </Typography>
        </Grid>
      </Grid>
    )
  }

export default RecommendationsPanelColumn
