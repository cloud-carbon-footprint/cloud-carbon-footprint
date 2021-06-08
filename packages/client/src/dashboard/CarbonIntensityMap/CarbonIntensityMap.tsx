/*
 * © 2021 ThoughtWorks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import {
  Card,
  Box,
  Typography,
  makeStyles,
  Select,
  MenuItem,
  FormControl,
  InputBase,
  createStyles,
  withStyles,
} from '@material-ui/core'
import { ReactComponent as AWSMap } from './AWSMap.svg'
import { ReactComponent as GCPMap } from './GCPMap.svg'
import { ReactComponent as AzureMap } from './AzureMap.svg'

const useStyles = makeStyles(({ palette }) => ({
  root: {
    width: '100%',
    height: '100%',
  },
  title: {
    margin: '0',
    fontSize: '24px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    opacity: '1',
    fontWeight: 900,
    color: 'rgba(0, 0, 0, 0.87)',
    padding: '.2em',
  },
  cloudProvider: {
    color: palette.primary.light,
    textAlign: 'center',
  },
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '24px',
  },
  map: {
    width: '100%',
    maxHeight: 700,
  },
}))

const BootstrapInput = withStyles(() =>
  createStyles({
    input: {
      border: '1px solid #ced4da',
      fontSize: 16,
      padding: '10px 26px 10px 12px',
      width: '65px',
      '&:hover': {
        borderColor: 'black',
      },
      '&:focus': {
        backgroundColor: 'white',
        borderRadius: 4,
      },
    },
  }),
)(InputBase)

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
              {Object.keys(intensityMaps).map((mapOption) => (
                <MenuItem key={mapOption} id="map-option" value={mapOption}>
                  {mapOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Typography className={`${classes.title} ${classes.cloudProvider}`}>
          {cloudProvider}
        </Typography>
        <Box paddingX={3}>{intensityMaps[cloudProvider]}</Box>
      </Box>
    </Card>
  )
}
