/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement } from 'react'
import { Box, Card, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import shruggingCloud from '../V1Shrugging-cloud-icon.svg'
import emptyStateIcon from '../V1Empty-state-generic-icon.svg'

const NoDataPage = (props: { isTop: boolean }): ReactElement => {
  const useStyles = makeStyles((theme) => {
    return {
      root: {
        width: '100%',
        height: '100%',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize: '24px',
        padding: theme.spacing(1, 2),
        color: '#b0bec5',
      },
      smallText: {
        fontSize: '17px',
      },
      addSpacing: {
        marginTop: '50px',
      },
    }
  })

  const classes = useStyles()
  return (
    <Card className={classes.root}>
      <Box data-testid="no-data-page">
        <Grid container>
          <Grid item xs={12}>
            {props.isTop ? (
              <img src={shruggingCloud} />
            ) : (
              <img src={emptyStateIcon} />
            )}
            <div className={classes.addSpacing}>
              There's no data to display!
            </div>
            <div>Expand your search parameters to get started.</div>
            {props.isTop && (
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

export default NoDataPage
