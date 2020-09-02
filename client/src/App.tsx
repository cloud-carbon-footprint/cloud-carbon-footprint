import React from 'react'
import { Container, Typography } from '@material-ui/core'
import CloudCarbonContainer from './CloudCarbonContainer'

// TO

function App() {
  return (
    <Container maxWidth={'xl'}>
      <Typography gutterBottom={true} variant="h2">
        Cloud Carbon Footprint
      </Typography>
      <CloudCarbonContainer />
    </Container>
  )
}

export default App
