import React from 'react'
import { Typography } from '@material-ui/core'
import CloudCarbonContainer from './CloudCarbonContainer'

function App() {
  return (
    <div>
      <Typography variant="h1">AWS Emissions and Wattage and Cost</Typography>
      <CloudCarbonContainer />
    </div>
  )
}

export default App
