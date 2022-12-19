/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement } from 'react'
import { Grid } from '@material-ui/core'
import LoadingMessage from '../../common/LoadingMessage'
import EmissionsFilterBar from './EmissionsFilterBar'
import CarbonIntensityMap from './CarbonIntensityMap'
import CarbonComparisonCard from './CarbonComparisonCard'
import EmissionsBreakdownCard from './EmissionsBreakdownCard'
import EmissionsOverTimeCard from './EmissionsOverTimeCard'
import useStyles from './emissionsMetricsStyles'
import EmissionsSidePanel from './EmissionsSidePanel/EmissionsSidePanel'
import { ClientConfig } from '../../Config'
import loadConfig from '../../ConfigLoader'

interface EmissionsMetricsPageProps {
  config?: ClientConfig
  onApiError?: (e: Error) => void
  footprint: any
}

export default function EmissionsMetricsPage({
  config = loadConfig(),
  onApiError,
  footprint,
}: EmissionsMetricsPageProps): ReactElement<EmissionsMetricsPageProps> {
  const classes = useStyles()

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
