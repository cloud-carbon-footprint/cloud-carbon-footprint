/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { ChangeEvent, ReactElement } from 'react'
import { Paper, Tabs, Tab, Box, Card, Typography, CardContent } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'
import { ChartDataTypes, EstimationResult } from '../../models/types'
import { makeStyles } from '@material-ui/core/styles'

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

  const handleChange = (event: ChangeEvent<Record<string, unknown>>, newValue: number) => {
    setValue(newValue)
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
          <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
            <Tab id="Region" label="Region" />
            <Tab id="Account" label="Account" />
            <Tab id="Service" label="Service" />
          </Tabs>
        </Paper>
        {changeDonutCharts(value)}
      </Box>
    </Card>
  )
}
