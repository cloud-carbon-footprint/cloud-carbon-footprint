/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Switch, Route } from 'react-router-dom'
import EmissionsMetricsPage from './pages/EmissionsMetricsPage'
import RecommendationsPage from './pages/RecommendationsPage/'
import ErrorPage from './layout/ErrorPage'
import HeaderBar from './layout/HeaderBar'
import MobileWarning from './layout/MobileWarning'

function App(): ReactElement {
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
      <Container maxWidth="xl" className={classes.appContainer}>
        <Switch>
          <Route path="/error" exact>
            <ErrorPage />
          </Route>
          <Route path="/recommendations" exact>
            <RecommendationsPage />
          </Route>
          <Route path="/">
            <EmissionsMetricsPage />
          </Route>
        </Switch>
      </Container>
    </>
  )
}

export default App
