/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { AppBar, Container, Toolbar, Typography } from '@material-ui/core'
import CloudCarbonContainer from './dashboard/CloudCarbonContainer'
import { CarbonFormulaDrawer } from './dashboard/CarbonFormulaDrawer'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      zIndex: theme.zIndex.drawer + 1,
    },
  }),
)

function App() {
  const classes = useStyles()

  return (
    <>
      <AppBar position="sticky" square={true} className={classes.appBar}>
        <Toolbar>
          <Typography component="h1" variant="h5">
            Cloud Carbon Footprint
          </Typography>
        </Toolbar>
      </AppBar>
      <CarbonFormulaDrawer />
      <Container maxWidth={'xl'}>
        <CloudCarbonContainer />
      </Container>
    </>
  )
}

export default App
