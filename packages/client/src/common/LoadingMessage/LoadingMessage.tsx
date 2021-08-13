/*
 * © 2021 Thoughtworks, Inc.
 */

import { CircularProgress, Grid } from '@material-ui/core'
import React, { FunctionComponent } from 'react'
import useStyles from './loadingMessageStyles'

type LoadingMessageProps = {
  message: string
}

const LoadingMessage: FunctionComponent<LoadingMessageProps> = ({
  message,
}) => {
  const classes = useStyles()
  return (
    <Grid container className={classes.loadingContainer}>
      <CircularProgress size={100} />
      <div className={classes.loadingMessage} id="loading-screen">
        {message}
      </div>
    </Grid>
  )
}

export default LoadingMessage
