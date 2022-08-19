/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement } from 'react'
import { Grid } from '@material-ui/core'
import moment, { unitOfTime } from 'moment'
import LoadingMessage from '../../common/LoadingMessage'
import EmissionsFilterBar from './EmissionsFilterBar'
import CarbonIntensityMap from './CarbonIntensityMap'
import CarbonComparisonCard from './CarbonComparisonCard'
import EmissionsBreakdownCard from './EmissionsBreakdownCard'
import EmissionsOverTimeCard from './EmissionsOverTimeCard'
import useStyles from './emissionsMetricsStyles'
import EmissionsSidePanel from './EmissionsSidePanel/EmissionsSidePanel'
import { useFootprintData } from '../../utils/hooks'
import { ClientConfig } from '../../Config'
import loadConfig from '../../ConfigLoader'

interface EmissionsMetricsPageProps {
  config?: ClientConfig
  onApiError?: (e: Error) => void
}

export default function EmissionsMetricsPage({
  config = loadConfig(),
  onApiError,
}: EmissionsMetricsPageProps): ReactElement<EmissionsMetricsPageProps> {
  const classes = useStyles()
  const dateRangeType: string = config.DATE_RANGE.TYPE
  const dateRangeValue: string = config.DATE_RANGE.VALUE
  let endDate: moment.Moment = moment
    .utc()
    .subtract(config.MINIMAL_DATE_AGE, 'days')
  if (config.END_DATE) {
    endDate = moment.utc(config.END_DATE)
  }

  let startDate: moment.Moment
  if (config.PREVIOUS_YEAR_OF_USAGE) {
    startDate = moment.utc(Date.UTC(endDate.year() - 1, 0, 1, 0, 0, 0, 0))
  } else if (config.START_DATE) {
    startDate = moment.utc(config.START_DATE)
  } else {
    startDate = moment
      .utc()
      .subtract(dateRangeValue, dateRangeType as unitOfTime.DurationConstructor)
  }

  const footprint = useFootprintData({
    baseUrl: config.BASE_URL,
    startDate,
    endDate,
    onApiError,
    groupBy: config.GROUP_BY,
    limit: parseInt(config.PAGE_LIMIT as unknown as string),
    ignoreCache: config.DISABLE_CACHE,
  })

  if (footprint.loading) {
    return (
      <LoadingMessage
        message={'Loading cloud data. This may take a while...'}
      />
    )
  }

  return (
    <div className={classes.pageContainer}>
      <EmissionsSidePanel />
      <EmissionsFilterBar {...footprint.filterBarProps} />
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          <EmissionsOverTimeCard data={footprint.filteredData} />
          <Grid item xs={12}>
            <Grid container spacing={3} className={classes.gridCardRow}>
              <CarbonComparisonCard data={footprint.filteredData} />
              <EmissionsBreakdownCard
                data={footprint.filteredData}
                baseUrl={config.BASE_URL}
                onApiError={onApiError}
              />
            </Grid>
          </Grid>
          <CarbonIntensityMap />
        </Grid>
      </div>
    </div>
  )
}
