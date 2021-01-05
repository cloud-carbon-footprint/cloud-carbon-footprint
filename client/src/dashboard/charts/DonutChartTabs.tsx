/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { ReactElement } from 'react'
import { Box, Card, Select, MenuItem } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'
import { ChartDataTypes, EstimationResult } from '../../models/types'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import FormControl from '@material-ui/core/FormControl'
const useStyles = makeStyles(() => {
  return {
    root: {
      width: '100%',
      height: '100%',
    },
    topContainer: {
      boxShadow: 'none',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: '24px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      opacity: '1',
      fontWeight: 'bold',
      color: 'rgba(0, 0, 0, 0.87)',
      padding: '.2em',
    },
  }
})

export const DonutChartTabs = (props: { data: EstimationResult[] }): ReactElement => {
  const classes = useStyles()
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setValue(event.target.value as number)
  }
  const changeDonutCharts = (value: number): ReactElement => {
    switch (value) {
      case 1:
        return (
          <div data-testid={ChartDataTypes.ACCOUNT}>
            <ApexDonutChart data={props.data} dataType={ChartDataTypes.ACCOUNT} />
          </div>
        )
        break
      case 2:
        return (
          <div data-testid={ChartDataTypes.SERVICE}>
            <ApexDonutChart data={props.data} dataType={ChartDataTypes.SERVICE} />
          </div>
        )
        break
      default:
        return (
          <div data-testid={ChartDataTypes.REGION}>
            <ApexDonutChart data={props.data} dataType={ChartDataTypes.REGION} />
          </div>
        )
    }
  }
  return (
    <Card className={classes.root}>
      <Box padding={3}>
        <Paper className={classes.topContainer}>
          <p className={classes.title}>Emissions by:</p>
          <FormControl variant={'outlined'}>
            <Select id="donut-chart-dropdown" value={value} onChange={handleChange}>
              <MenuItem value={0}>Region</MenuItem>
              <MenuItem value={1}>Account</MenuItem>
              <MenuItem value={2}>Service</MenuItem>
            </Select>
          </FormControl>
        </Paper>
        {changeDonutCharts(value)}
      </Box>
    </Card>
  )
}
