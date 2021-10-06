/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import { Box, Typography } from '@material-ui/core'
import SelectDropdown from 'common/SelectDropdown'
import DashboardCard from 'layout/DashboardCard'
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
    <DashboardCard>
      <>
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
      </>
    </DashboardCard>
  )
}

export default CarbonIntensityMap
