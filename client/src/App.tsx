import React from 'react'
import { Container, Typography } from '@material-ui/core'
import CloudCarbonContainer from './CloudCarbonContainer'

function App() {
  return (
    <Container maxWidth={'xl'}>
      <Typography gutterBottom={true} variant="h1">
        AWS Emissions and Wattage and Cost
      </Typography>
      <CloudCarbonContainer />
    </Container>
  )
}

export default App
