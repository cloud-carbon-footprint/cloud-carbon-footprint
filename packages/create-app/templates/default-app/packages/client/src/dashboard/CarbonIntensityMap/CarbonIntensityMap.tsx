/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import {
  Card,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from '@material-ui/core'
import { ReactComponent as AWSMap } from './AWSMap.svg'
import { ReactComponent as GCPMap } from './GCPMap.svg'
import { ReactComponent as AzureMap } from './AzureMap.svg'
import { useStyles, BootstrapInput } from './carbonIntensityStyles'

type CloudProvider = 'AWS' | 'GCP' | 'Azure'

type IntensityMaps = {
  [provider in CloudProvider]: React.ReactNode
}

export const CarbonIntensityMap = (): ReactElement => {
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
    <Card className={classes.root}>
      <Box padding={3}>
        <Box className={classes.topContainer}>
          <Typography className={classes.title}>
            Carbon Intensity Map
          </Typography>
          <FormControl variant="outlined">
            <Select
              id="map-select"
              data-testid="select"
              value={cloudProvider}
              onChange={handleChange}
              input={<BootstrapInput />}
            >
              {Object.keys(intensityMaps).map((providerOption) => (
                <MenuItem key={providerOption} value={providerOption}>
                  {providerOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box paddingX={3}>{intensityMaps[cloudProvider]}</Box>
      </Box>
    </Card>
  )
}
