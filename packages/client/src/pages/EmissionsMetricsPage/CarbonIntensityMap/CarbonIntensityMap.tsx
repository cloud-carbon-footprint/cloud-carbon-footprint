/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import { Card, Box, Typography, Grid } from '@material-ui/core'
import { ReactComponent as AWSMap } from './AWSMap.svg'
import { ReactComponent as GCPMap } from './GCPMap.svg'
import { ReactComponent as AzureMap } from './AzureMap.svg'
import { useStyles } from './carbonIntensityStyles'
import SelectDropdown from '../../../common/SelectDropdown'

type CloudProvider = 'AWS' | 'GCP' | 'Azure'

type IntensityMaps = {
  [provider in CloudProvider]: React.ReactNode
}

const CarbonIntensityMap = (): ReactElement => {
  const [cloudProvider, setCloudProvider] = useState('AWS')
  const classes = useStyles()

  const intensityMaps: IntensityMaps = {
    AWS: <AWSMap className={classes.map} data-testid="awsIntensityMap" />,
    GCP: <GCPMap className={classes.map} data-testid="gcpIntensityMap" />,
    Azure: <AzureMap className={classes.map} data-testid="azureIntensityMap" />,
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
          <Box paddingX={3}>{intensityMaps[cloudProvider]}</Box>
        </Box>
      </Card>
    </Grid>
  )
}

export default CarbonIntensityMap
