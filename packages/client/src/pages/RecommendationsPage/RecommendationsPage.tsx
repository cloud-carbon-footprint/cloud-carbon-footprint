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
import { checkFootprintDates } from '../../utils/helpers/handleDates'

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

  const groupBy = footprint?.data[0]?.groupBy
  const forecastDetails = checkFootprintDates({
    footprint,
    groupBy,
  })

  const recommendations = useRecommendationData({
    baseUrl: config.BASE_URL,
    onApiError,
    groupBy: config.GROUP_BY,
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
            emissionsData={recommendations.filteredEmissionsData}
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
