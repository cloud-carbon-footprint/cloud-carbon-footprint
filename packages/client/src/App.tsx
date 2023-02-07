/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useCallback, useState } from 'react'
import { Moment } from 'moment'
import { AxiosError } from 'axios'
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Route, Routes, useNavigate } from 'react-router-dom'
import EmissionsMetricsPage from './pages/EmissionsMetricsPage'
import RecommendationsPage from './pages/RecommendationsPage/'
import ErrorPage from './layout/ErrorPage'
import HeaderBar from './layout/HeaderBar'
import MobileWarning from './layout/MobileWarning'
import { formatAxiosError } from './layout/ErrorPage/ErrorPage'
import { ClientConfig } from './Config'
import loadConfig from './ConfigLoader'
import { useFootprintData } from './utils/hooks'
import { handleEmissionDateRange } from './utils/helpers/handleDates'
import LoadingMessage from './common/LoadingMessage'

interface AppProps {
  config?: ClientConfig
}
export function App({ config = loadConfig() }: AppProps): ReactElement {
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const onApiError = useCallback(
    (e: AxiosError) => {
      console.error(e)
      setErrorMessage(e.response.data)
      navigate('/error', { state: formatAxiosError(e) })
    },
    [navigate],
  )

  const endDate: Moment = handleEmissionDateRange({
    config: loadConfig(),
  }).end
  const startDate: Moment = handleEmissionDateRange({
    config: loadConfig(),
  }).start

  const footprint = useFootprintData({
    baseUrl: config.BASE_URL,
    startDate,
    endDate,
    onApiError,
    groupBy: config.GROUP_BY,
    limit: parseInt(config.PAGE_LIMIT as unknown as string),
    ignoreCache: config.DISABLE_CACHE,
  })

  const [mobileWarningEnabled, setMobileWarningEnabled] = useState(
    window.innerWidth < 768,
  )

  const handleWarningClose = () => {
    setMobileWarningEnabled(false)
  }

  const useStyles = makeStyles(() => ({
    appContainer: {
      padding: 0,
      height: 'calc(100vh - 65px)',
    },
  }))

  const classes = useStyles()

  if (mobileWarningEnabled) {
    return (
      <Container maxWidth="xl" className={classes.appContainer}>
        <HeaderBar />
        <MobileWarning handleClose={handleWarningClose} />
      </Container>
    )
  }

  if (footprint.loading)
    return (
      <LoadingMessage message="Loading cloud data. This may take a while..." />
    )

  return (
    <>
      <HeaderBar />
      <Container maxWidth={false} className={classes.appContainer}>
        <Routes>
          <Route
            path="/"
            element={
              // If checkDataLoad true show loading message
              <EmissionsMetricsPage
                config={config}
                onApiError={onApiError}
                footprint={footprint}
              />
            }
          />
          <Route
            path="/recommendations"
            element={
              <RecommendationsPage
                config={config}
                onApiError={onApiError}
                footprint={footprint}
              />
            }
          />
          <Route
            path="/error"
            element={<ErrorPage errorMessage={errorMessage} />}
          />
        </Routes>
      </Container>
    </>
  )
}
