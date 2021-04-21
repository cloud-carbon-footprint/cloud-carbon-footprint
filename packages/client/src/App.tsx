/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Switch, Route } from 'react-router-dom'
import ErrorPage from './dashboard/ErrorPage'
import CloudCarbonContainer from './dashboard/CloudCarbonContainer'
import { CarbonFormulaDrawer } from './dashboard/CarbonFormulaDrawer'
import HeaderBar from './dashboard/HeaderBar'

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
          <Route path="/">
            <CarbonFormulaDrawer />
            <CloudCarbonContainer />
          </Route>
        </Switch>
      </Container>
    </>
  )
}

export default App
