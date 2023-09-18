/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import { Grid } from '@material-ui/core'
import RecommendationsTable from './RecommendationsTable'
import useStyles from './recommendationsPageStyles'
import RecommendationsFilterBar from './RecommendationsFilterBar'
import LoadingMessage from '../../common/LoadingMessage'
import { ErrorState } from '../../layout/ErrorPage/ErrorPage'
import { useRecommendationData } from '../../utils/hooks/RecommendationsDataHook'
import { ClientConfig } from '../../Config'
import loadConfig from '../../ConfigLoader'
import { Co2eUnit } from '../../Types'
import { FootprintData } from '../../utils/hooks'
import {
  checkFootprintDates,
  sliceFootprintDataByLastMonth,
} from '../../utils/helpers'

interface RecommendationsPageProps {
  onApiError?: (e: ErrorState) => void
  config?: ClientConfig
  footprint: FootprintData
}

const RecommendationsPage = ({
  onApiError,
  config = loadConfig(),
  footprint,
}): ReactElement<RecommendationsPageProps> => {
  const classes = useStyles()

  const [co2eUnit, setCo2eUnit] = useState(Co2eUnit.MetricTonnes)

  const groupBy = config.GROUP_BY
  const hasForecastValidationDisabled = config.DISABLE_FORECAST_VALIDATION

  let forecastDetails = { missingDates: [], groupBy }

  const slicedFootprint = sliceFootprintDataByLastMonth(footprint.data, groupBy)
  if (!hasForecastValidationDisabled) {
    forecastDetails = checkFootprintDates(slicedFootprint, groupBy)
  }

  const recommendations = useRecommendationData({
    baseUrl: config.BASE_URL,
    onApiError,
    groupBy,
    footprint,
  })

  if (recommendations.loading)
    return (
      <LoadingMessage message="Loading recommendations. This may take a while..." />
    )

  return (
    <div className={classes.pageContainer}>
      <RecommendationsFilterBar
        {...recommendations.filterBarProps}
        setCo2eUnit={setCo2eUnit}
      />
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          <RecommendationsTable
            emissionsData={slicedFootprint}
            recommendations={recommendations.filteredRecommendationData}
            co2eUnit={co2eUnit}
            forecastDetails={forecastDetails}
          />
        </Grid>
      </div>
    </div>
  )
}

export default RecommendationsPage
