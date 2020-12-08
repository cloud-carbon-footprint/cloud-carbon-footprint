/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import React, { ChangeEvent, ReactElement } from 'react'
import { Paper, Tabs, Tab, Box, Card } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'
import { ChartDataTypes, EstimationResult } from '../../models/types'

export const DonutChartTabs = (props: { data: EstimationResult[] }): ReactElement => {
  const [value, setValue] = React.useState(0)

  const handleChange = (event: ChangeEvent<Record<string, unknown>>, newValue: number) => {
    setValue(newValue)
  }
  const changeDonutCharts = (value: number): ReactElement => {
    switch (value) {
      case 1:
        return (
          <div data-testid={ChartDataTypes.SERVICE}>
            <ApexDonutChart data={props.data} dataType={ChartDataTypes.SERVICE} />
          </div>
        )
        break
      case 2:
        return (
          <div data-testid={ChartDataTypes.ACCOUNT}>
            <ApexDonutChart data={props.data} dataType={ChartDataTypes.ACCOUNT} />
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
    <Card style={{ width: '100%', height: '100%' }}>
      <Box padding={3}>
        <Paper style={{ boxShadow: 'none' }}>
          <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
            <Tab id="Region" label="Emissions By Region" />
            <Tab id="Service" label="Emissions By Service" />
            <Tab id="Account" label="Emissions By Account" />
          </Tabs>
        </Paper>
        {changeDonutCharts(value)}
      </Box>
    </Card>
  )
}
