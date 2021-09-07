/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import { Card, Box, Typography, Grid } from '@material-ui/core'
import SelectDropdown from 'common/SelectDropdown'
import AWSMap from './AWSMap.png'
import GCPMap from './GCPMap.png'
import AzureMap from './AzureMap.png'
import useStyles from './carbonIntensityStyles'

type CloudProvider = 'AWS' | 'GCP' | 'Azure'

type IntensityMaps = {
  [provider in CloudProvider]: React.ReactNode
}

const CarbonIntensityMap = (): ReactElement => {
  const [cloudProvider, setCloudProvider] = useState('AWS')
  const classes = useStyles()

  const intensityMaps: IntensityMaps = {
    AWS: AWSMap,
    GCP: GCPMap,
    Azure: AzureMap,
  }

  const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
    setCloudProvider(event.target.value)
  }

  return (
    <Grid item xs={12}>
      <Card className={classes.root}>
        <Box padding={3}>
          <Box className={classes.topContainer}>
            <Typography className={classes.title}>
              Carbon Intensity Map
            </Typography>
            <SelectDropdown
              id="map"
              value={cloudProvider}
              dropdownOptions={Object.keys(intensityMaps)}
              handleChange={handleChange}
            />
          </Box>
          <Box paddingX={3} textAlign="center">
            <img
              src={intensityMaps[cloudProvider]}
              className={classes.map}
              alt={`${cloudProvider} Map`}
              data-testid={`${cloudProvider.toLowerCase()}IntensityMap`}
            />
          </Box>
        </Box>
      </Card>
    </Grid>
  )
}

export default CarbonIntensityMap
