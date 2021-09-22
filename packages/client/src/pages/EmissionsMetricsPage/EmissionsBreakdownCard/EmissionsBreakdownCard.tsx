/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement } from 'react'
import { Paper } from '@material-ui/core'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { ChartDataTypes } from 'Types'
import SelectDropdown from 'common/SelectDropdown'
import DashboardCard from 'layout/DashboardCard'
import ApexBarChart from './ApexBarChart'
import useStyles from './emissionsBreakdownStyles'

type EmissionsBreakdownContainerProps = {
  data: EstimationResult[]
}

const EmissionsBreakdownCard: FunctionComponent<EmissionsBreakdownContainerProps> =
  ({ data }): ReactElement => {
    const classes = useStyles()
    const [chartType, setChartType] = React.useState(ChartDataTypes.REGION)

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      setChartType(event.target.value as ChartDataTypes)
    }

    return (
      <DashboardCard isHalf>
        <>
          <Paper
            className={classes.topContainer}
            id="emissionsBreakdownContainer"
          >
            <p className={classes.title}>Emissions Breakdown</p>
            <SelectDropdown
              id="breakdown"
              value={chartType}
              dropdownOptions={Object.values(ChartDataTypes)}
              handleChange={handleChange}
            />
          </Paper>
          <ApexBarChart data={data} dataType={chartType} />
        </>
      </DashboardCard>
    )
  }

export default EmissionsBreakdownCard
