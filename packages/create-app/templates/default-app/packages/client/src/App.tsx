/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Switch, Route } from 'react-router-dom'
import ErrorPage from './layout/ErrorPage'
import EmissionsMetricsPage from './pages/EmissionsMetricsPage'
import RecommendationsPage from './pages/RecommendationsPage/'
import HeaderBar from './layout/HeaderBar'

function App(): ReactElement {
  const useStyles = makeStyles(() => ({
    appContainer: {
      padding: 0,
    },
  }))

  const classes = useStyles()

  return (
    <>
      <HeaderBar />

      <Container maxWidth={'xl'} className={classes.appContainer}>
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
