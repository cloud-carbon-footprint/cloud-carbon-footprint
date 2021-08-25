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
import useFilters from './EmissionsFilterBar/utils/FilterHook'
import EmissionsFilterBar from './EmissionsFilterBar'
import CarbonIntensityMap from './CarbonIntensityMap'
import CarbonComparisonCard from './CarbonComparisonCard'
import EmissionsBreakdownCard from './EmissionsBreakdownCard'
import EmissionsOverTimeCard from './EmissionsOverTimeCard'
import useStyles from './emissionsMetricsStyles'
import EmissionsSidePanel from './EmissionsSidePanel/EmissionsSidePanel'
import LoadingMessage from '../../common/LoadingMessage'

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

  const { filteredData, filters, setFilters } = useFilters(
    data,
    filteredDataResults,
  )

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
            filteredData={filteredData}
          />
          <Grid item xs={12}>
            <Grid container spacing={3} className={classes.gridCardRow}>
              <CarbonComparisonCard
                containerClass={classes.gridCardHalf}
                data={filteredData}
              />
              <EmissionsBreakdownCard
                containerClass={classes.gridCardHalf}
                data={filteredData}
              />
            </Grid>
          </Grid>
          <CarbonIntensityMap />
        </Grid>
      </div>
    </>
  )
}
