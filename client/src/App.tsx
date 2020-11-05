/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { ReactElement } from 'react'
import { Container } from '@material-ui/core'
import { Switch, Route } from 'react-router-dom'
import ErrorPage from './dashboard/ErrorPage'
import CloudCarbonContainer from './dashboard/CloudCarbonContainer'
import { CarbonFormulaDrawer } from './dashboard/CarbonFormulaDrawer'
import HeaderBar from './dashboard/HeaderBar'

function App(): ReactElement {
  return (
    <>
      <HeaderBar />

      <Container maxWidth={'xl'}>
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
