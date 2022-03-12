/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useCallback, useState } from 'react'
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Routes, Route, useNavigate } from 'react-router-dom'
import EmissionsMetricsPage from './pages/EmissionsMetricsPage'
import RecommendationsPage from './pages/RecommendationsPage/'
import ErrorPage from './layout/ErrorPage'
import HeaderBar from './layout/HeaderBar'
import MobileWarning from './layout/MobileWarning'
import { AxiosError } from 'axios'
import { formatAxiosError } from './layout/ErrorPage/ErrorPage'

function App(): ReactElement {
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
            element={<EmissionsMetricsPage onApiError={onApiError} />}
          />
          <Route
            path="/recommendations"
            element={<RecommendationsPage onApiError={onApiError} />}
          />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
      </Container>
    </>
  )
}

export default App
