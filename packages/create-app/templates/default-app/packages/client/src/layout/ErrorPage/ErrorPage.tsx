/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import CloudOffIcon from '@material-ui/icons/CloudOff'
import { Grid } from '@material-ui/core'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { createStyles, Theme } from '@material-ui/core/styles'

type ErrorState = {
  statusText?: string
  status?: string
}

type ErrorHandlingType = {
  handleApiError: (error: ErrorState) => void
  error: ErrorState
  setError: (e: ErrorState) => void
}

export const useErrorHandling = (): ErrorHandlingType => {
  const history = useHistory()
  const [error, setError] = useState({})

  const handleApiError = (error: ErrorState) => {
    if (error.status) {
      history.push(`/error`, error)
    }
  }

  return { handleApiError, error, setError }
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    cloudIcon: {
      fontSize: '175px',
      color: theme.palette.primary.main,
    },
    errorStatus: {
      fontSize: '36px',
      textAlign: 'center',
    },
    errorMessage: {
      fontSize: '18px',
    },
    gridPlacement: {
      marginBottom: '25%',
    },
  }),
)

const ErrorPage = (): ReactElement => {
  const location = useLocation()
  const { statusText, status } = location.state as ErrorState
  let message
  if (status && status.toString() === '500') {
    message = status + ' Internal Server Error'
  }

  const classes = useStyles()

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ minHeight: '100vh' }}
    >
      <CloudOffIcon className={classes.cloudIcon} />
      <Grid item className={classes.gridPlacement} xs={12}>
        <div data-testid="error-page">
          {message ? (
            <h1 className={classes.errorStatus}>{message}</h1>
          ) : (
            <h1 className={classes.errorStatus}>
              {status} {statusText}
            </h1>
          )}
          <div className={classes.errorMessage}>
            Something has gone wrong, please try again later
          </div>
        </div>
      </Grid>
    </Grid>
  )
}

export default ErrorPage
