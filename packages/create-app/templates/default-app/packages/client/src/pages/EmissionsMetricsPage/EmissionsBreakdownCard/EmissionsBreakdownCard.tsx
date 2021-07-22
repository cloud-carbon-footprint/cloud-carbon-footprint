/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Box, Grid, Card, Paper } from '@material-ui/core'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { ChartDataTypes } from 'Types'
import SelectDropdown from 'common/SelectDropdown'
import ApexBarChart from './ApexBarChart'
import useStyles from './emissionsBreakdownStyles'

type EmissionsBreakdownContainerProps = {
  containerClass: string
  data: EstimationResult[]
}

const EmissionsBreakdownCard: FunctionComponent<EmissionsBreakdownContainerProps> =
  ({ containerClass, data }): ReactElement => {
    const classes = useStyles()
    const [chartType, setChartType] = React.useState(ChartDataTypes.REGION)

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      setChartType(event.target.value as ChartDataTypes)
    }

    return (
      <Grid item className={containerClass}>
        <Card className={classes.root} id="emissionsBreakdownContainer">
          <Box padding={3}>
            <Paper className={classes.topContainer}>
              <p className={classes.title}>Emissions Breakdown</p>
              <SelectDropdown
                id="breakdown"
                value={chartType}
                dropdownOptions={Object.values(ChartDataTypes)}
                handleChange={handleChange}
              />
            </Paper>
            <ApexBarChart data={data} dataType={chartType} />
          </Box>
        </Card>
      </Grid>
    )
  }

export default EmissionsBreakdownCard
