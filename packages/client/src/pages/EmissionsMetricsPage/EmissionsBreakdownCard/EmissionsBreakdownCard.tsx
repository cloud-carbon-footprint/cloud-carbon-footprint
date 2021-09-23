/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { FunctionComponent, ReactElement, useState } from 'react'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { ChartDataTypes } from 'Types'
import SelectDropdown from 'common/SelectDropdown'
import NoDataMessage from 'common/NoDataMessage'
import DashboardCard from 'layout/DashboardCard'
import { useRemoteEmissionService } from 'utils/hooks'
import { sumCO2ByServiceOrRegion } from 'utils/helpers'
import ApexBarChart from './ApexBarChart'
import useStyles from './emissionsBreakdownStyles'

type EmissionsBreakdownContainerProps = {
  data: EstimationResult[]
}

const EmissionsBreakdownCard: FunctionComponent<EmissionsBreakdownContainerProps> =
  ({ data }): ReactElement => {
    const classes = useStyles()
    const [chartType, setChartType] = useState(ChartDataTypes.REGION)

    const { data: emissionsData, loading: emissionsLoading } =
      useRemoteEmissionService()
    const barChartData = sumCO2ByServiceOrRegion(
      data as EstimationResult[],
      chartType,
    )

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
      setChartType(event.target.value as ChartDataTypes)
    }

    if (!data?.length || emissionsLoading) {
      return <NoDataMessage isHalf title="Emissions Breakdown" />
    }

    return (
      <DashboardCard isHalf>
        <>
          <div
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
          </div>
          <ApexBarChart
            data={barChartData}
            dataType={chartType}
            emissionsData={emissionsData}
          />
        </>
      </DashboardCard>
    )
  }

export default EmissionsBreakdownCard
