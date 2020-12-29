/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { ReactElement } from 'react'
import { Box, Card, Typography, CardContent, Select, MenuItem } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'
import { ChartDataTypes, EstimationResult } from '../../models/types'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
const useStyles = makeStyles(({ palette, typography }) => {
  return {
    root: {
      width: '100%',
      height: '100%',
    },
    topContainer: {
      backgroundColor: palette.primary.main,
      textAlign: 'center',
    },
    title: {
      color: palette.primary.contrastText,
      fontWeight: typography.fontWeightBold,
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
      <CardContent className={classes.topContainer}>
        <Typography className={classes.title} variant="h4">
          Emissions
        </Typography>
        <Typography className={classes.title} variant="h4">
          by
        </Typography>
      </CardContent>
      <Box padding={3}>
        <Paper style={{ boxShadow: 'none' }}>
          <Select id="donut-chart-dropdown" value={value} onChange={handleChange} disableUnderline>
            <MenuItem value={0}>Region</MenuItem>
            <MenuItem value={1}>Account</MenuItem>
            <MenuItem value={2}>Service</MenuItem>
          </Select>
        </Paper>
        {changeDonutCharts(value)}
      </Box>
    </Card>
  )
}
