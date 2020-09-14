import React from 'react'
import { AppBar, Container, Toolbar, Typography } from '@material-ui/core'
import CloudCarbonContainer from './dashboard/CloudCarbonContainer'

function App() {
  return (
    <>
      <AppBar position="sticky" square={true}>
        <Toolbar>
          <Typography component="h1" variant="h5">
            Cloud Carbon Footprint
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth={'xl'}>
        <CloudCarbonContainer />
      </Container>
    </>
  )
}

export default App
