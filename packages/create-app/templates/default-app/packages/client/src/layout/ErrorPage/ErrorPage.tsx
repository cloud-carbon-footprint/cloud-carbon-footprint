/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import CloudOffIcon from '@material-ui/icons/CloudOff'
import { Grid } from '@material-ui/core'
import makeStyles from '@material-ui/core/styles/makeStyles'
import { createStyles, Theme } from '@material-ui/core/styles'
import { AxiosError } from 'axios'

export type ErrorState = {
  statusText?: string
  status?: string
}

export type ErrorHandlingType = {
  error: AxiosError | null
  setError: (e?: AxiosError) => void
}

export const useAxiosErrorHandling = (
  onApiError?: (e: Error) => void,
): ErrorHandlingType => {
  const [error, setError] = useState<AxiosError | null>(null)

  useEffect(() => {
    if (error && onApiError) {
      onApiError(error)
    }
  }, [error])

  return { error, setError }
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
  }),
)

const DEFAULT_ERROR = {
  status: '520',
  statusText: 'Unknown Error',
}

export const formatAxiosError = (e: AxiosError): ErrorState => {
  return e.response
    ? {
        status: e.response.status.toString(),
        statusText: e.response.statusText,
      }
    : DEFAULT_ERROR
}

const ErrorPage = (): ReactElement => {
  const location = useLocation()
  const { statusText, status } = (location.state as ErrorState) ?? DEFAULT_ERROR

  const classes = useStyles()

  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justify="center"
      style={{ height: '100%' }}
    >
      <CloudOffIcon className={classes.cloudIcon} />
      <div data-testid="error-page">
        <h1 className={classes.errorStatus}>
          {status} {statusText}
        </h1>
        <div className={classes.errorMessage}>
          Something has gone wrong, please try again later
        </div>
      </div>
    </Grid>
  )
}

export default ErrorPage
