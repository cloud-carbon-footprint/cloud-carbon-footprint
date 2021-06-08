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
  topContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '24px',
  },
  highlight: {
    color: palette.primary.main,
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

export const CarbonIntensityMap = (): ReactElement => {
  const [cloudProvider] = useState('AWS')
  const classes = useStyles()

  // const handleChange = (event: React.ChangeEvent<{ value: string }>) => {
  //   setCloudProvider(event.target.value)
  // }

  return (
    <Card className={classes.root}>
      <Box padding={3}>
        <Box className={classes.topContainer}>
          <Typography className={classes.title}>
            Carbon Intensity Map -{' '}
            <span className={classes.highlight}>{cloudProvider}</span>
          </Typography>
          <FormControl variant="outlined">
            <Select
              id="map-select"
              data-testid="select"
              value={cloudProvider}
              // onChange={handleChange}
              input={<BootstrapInput />}
            >
              <MenuItem id="map-options" value="AWS">
                AWS
              </MenuItem>
              <MenuItem id="map-options" value="GCP">
                GCP
              </MenuItem>
              <MenuItem id="map-options" value="Azure">
                Azure
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box padding={3}>
          <AWSMap className={classes.map} data-testid="intensityMap" />
        </Box>
      </Box>
    </Card>
  )
}
