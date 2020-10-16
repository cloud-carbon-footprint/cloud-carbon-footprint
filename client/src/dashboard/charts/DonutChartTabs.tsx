import React from 'react'
import { Paper, Tabs, Tab, Box, Card } from '@material-ui/core'
import { ApexDonutChart } from './ApexDonutChart'

export const DonutChartTabs = (props: { data: any }) => {
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Card style={{ width: '100%', height: '100%' }}>
      <Box padding={3}>
        <Paper>
          <Tabs value={value} onChange={handleChange} indicatorColor="primary" textColor="primary" centered>
            <Tab id="Region" label="Emissions By Region" />
            <Tab id="Service" label="Emissions By Service" />
          </Tabs>
        </Paper>
        {value ? (
          <ApexDonutChart data={props.data} dataType="service" data-testid="service" />
        ) : (
          <ApexDonutChart data={props.data} dataType="region" data-testid="region" />
        )}
      </Box>
    </Card>
  )
}
