/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement } from 'react'
import { Grid } from '@material-ui/core'
import moment, { unitOfTime } from 'moment'
import { useRemoteService } from 'utils/hooks'
import { useFilterDataFromEstimates } from 'utils/helpers'
import { FilterResultResponse } from 'Types'
import config from 'ConfigLoader'
import useFilters from 'common/FilterBar/utils/FilterHook'
import LoadingMessage from 'common/LoadingMessage'
import EmissionsFilterBar from './EmissionsFilterBar'
import CarbonIntensityMap from './CarbonIntensityMap'
import CarbonComparisonCard from './CarbonComparisonCard'
import EmissionsBreakdownCard from './EmissionsBreakdownCard'
import EmissionsOverTimeCard from './EmissionsOverTimeCard'
import useStyles from './emissionsMetricsStyles'
import EmissionsSidePanel from './EmissionsSidePanel/EmissionsSidePanel'
import { EmissionsFilters } from './EmissionsFilterBar/utils/EmissionsFilters'
import { EstimationResult } from '@cloud-carbon-footprint/common'

export default function EmissionsMetricsPage(): ReactElement {
  const classes = useStyles()
  const dateRangeType: string = config().DATE_RANGE.TYPE
  const dateRangeValue: string = config().DATE_RANGE.VALUE
  const endDate: moment.Moment = moment.utc()

  let startDate: moment.Moment
  if (config().PREVIOUS_YEAR_OF_USAGE) {
    startDate = moment.utc(Date.UTC(endDate.year() - 1, 0, 1, 0, 0, 0, 0))
  } else {
    startDate = moment
      .utc()
      .subtract(dateRangeValue, dateRangeType as unitOfTime.DurationConstructor)
  }

  const { data, loading } = useRemoteService([], startDate, endDate)

  const filteredDataResults: FilterResultResponse =
    useFilterDataFromEstimates(data)

  const buildFilters = (filteredResponse: FilterResultResponse) => {
    const updatedConfig = EmissionsFilters.generateConfig(filteredResponse)
    return new EmissionsFilters(updatedConfig)
  }

  const { filteredData, filters, setFilters } = useFilters(
    data,
    buildFilters,
    filteredDataResults,
  )
  const filteredEstimationData = filteredData as EstimationResult[]

  if (loading) {
    return (
      <LoadingMessage
        message={'Loading cloud data. This may take a while...'}
      />
    )
  }

  return (
    <>
      <EmissionsSidePanel />
      <EmissionsFilterBar
        filters={filters}
        setFilters={setFilters}
        filteredDataResults={filteredDataResults}
      />
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          <EmissionsOverTimeCard
            classes={classes}
            filteredData={filteredEstimationData}
          />
          <Grid item xs={12}>
            <Grid container spacing={3} className={classes.gridCardRow}>
              <CarbonComparisonCard
                containerClass={classes.gridCardHalf}
                data={filteredEstimationData}
              />
              <EmissionsBreakdownCard
                containerClass={classes.gridCardHalf}
                data={filteredEstimationData}
              />
            </Grid>
          </Grid>
          <CarbonIntensityMap />
        </Grid>
      </div>
    </>
  )
}
