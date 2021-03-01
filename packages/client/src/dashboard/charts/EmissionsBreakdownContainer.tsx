/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { ReactElement } from 'react'
import {
  Box,
  Card,
  createStyles,
  FormControl,
  InputBase,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  withStyles,
} from '@material-ui/core'
import { ChartDataTypes, EstimationResult } from '../../models/types'
import { ApexBarChart } from './ApexBarChart'

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

const useStyles = makeStyles(() => {
  return {
    root: {
      width: '100%',
      height: '100%',
    },
    topContainer: {
      boxShadow: 'none',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: '24px',
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
  }
})

export const EmissionsBreakdownContainer = (props: { data: EstimationResult[] }): ReactElement => {
  const classes = useStyles()
  const [value, setValue] = React.useState(ChartDataTypes.REGION)

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setValue(event.target.value as ChartDataTypes)
  }

  return (
    <Card className={classes.root}>
      <Box padding={3}>
        <Paper className={classes.topContainer}>
          <p className={classes.title}>Emissions Breakdown</p>
          <FormControl variant={'outlined'}>
            <Select value={value} onChange={handleChange} input={<BootstrapInput />}>
              <MenuItem value={ChartDataTypes.REGION}>Region</MenuItem>
              <MenuItem value={ChartDataTypes.ACCOUNT}>Account</MenuItem>
              <MenuItem value={ChartDataTypes.SERVICE}>Service</MenuItem>
            </Select>
          </FormControl>
        </Paper>
        <ApexBarChart data={props.data} dataType={value} />
      </Box>
    </Card>
  )
}
