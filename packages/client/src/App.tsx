/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useCallback, useState } from 'react'
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Route, Routes, useNavigate } from 'react-router-dom'
import EmissionsMetricsPage from './pages/EmissionsMetricsPage'
import RecommendationsPage from './pages/RecommendationsPage/'
import ErrorPage from './layout/ErrorPage'
import HeaderBar from './layout/HeaderBar'
import MobileWarning from './layout/MobileWarning'
import { AxiosError } from 'axios'
import { formatAxiosError } from './layout/ErrorPage/ErrorPage'
import { ClientConfig } from './Config'
import loadConfig from './ConfigLoader'

interface AppProps {
  config?: ClientConfig
}
export function App({ config = loadConfig() }: AppProps): ReactElement {
  const navigate = useNavigate()
  const onApiError = useCallback(
    (e: AxiosError) => {
      console.error(e)
      navigate('/error', { state: formatAxiosError(e) })
    },
    [navigate],
  )

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

  return (
    <>
      <HeaderBar />
      <Container maxWidth={false} className={classes.appContainer}>
        <Routes>
          <Route
            path="/"
            element={
              <EmissionsMetricsPage config={config} onApiError={onApiError} />
            }
          />
          <Route
            path="/recommendations"
            element={
              <RecommendationsPage config={config} onApiError={onApiError} />
            }
          />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Container>
    </>
  )
}
