/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useMemo } from 'react'
import { Grid } from '@mui/material'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { FilterOptions, FilterResultResponse } from 'src/Types'
import { buildFilters, FootprintData } from 'src/utils/hooks'
import useFilters from 'src/common/FilterBar/utils/FilterHook'
import { useFilterDataFromEstimates } from 'src/utils/helpers'
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
  footprint: FootprintData
}

export default function EmissionsMetricsPage({
  config = loadConfig(),
  onApiError,
  footprint,
}: EmissionsMetricsPageProps): ReactElement<EmissionsMetricsPageProps> {
  const { classes } = useStyles()

  const filterOptions: FilterResultResponse = useFilterDataFromEstimates(
    footprint.data,
  )

  const { filteredData, filters, setFilters } = useFilters(
    footprint.data,
    buildFilters,
    filterOptions,
  )

  const typedFilteredData = filteredData as EstimationResult[]

  const filterBarProps = useMemo(
    () => ({
      filterOptions: filterOptions as unknown as FilterOptions,
      filters,
      setFilters,
    }),
    [filterOptions, filters, setFilters],
  )

  return (
    <div className={classes.pageContainer}>
      <EmissionsSidePanel />
      <EmissionsFilterBar {...filterBarProps} />
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          <EmissionsOverTimeCard data={typedFilteredData} />
          <Grid item xs={12}>
            <Grid container spacing={3} className={classes.gridCardRow}>
              <CarbonComparisonCard data={typedFilteredData} />
              <EmissionsBreakdownCard
                data={typedFilteredData}
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
