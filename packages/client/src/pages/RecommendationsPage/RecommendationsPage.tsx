/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, useState } from 'react'
import { Grid } from '@material-ui/core'
import LoadingMessage from '../../common/LoadingMessage'
import RecommendationsTable from './RecommendationsTable'
import useStyles from './recommendationsPageStyles'
import RecommendationsFilterBar from './RecommendationsFilterBar'
import { ErrorState } from '../../layout/ErrorPage/ErrorPage'
import { useRecommendationData } from '../../utils/hooks/RecommendationsDataHook'
import { ClientConfig } from '../../Config'
import loadConfig from '../../ConfigLoader'
import { Co2eUnit } from '../../Types'

interface RecommendationsPageProps {
  onApiError?: (e: ErrorState) => void
  config?: ClientConfig
}

const RecommendationsPage = ({
  onApiError,
  config = loadConfig(),
}): ReactElement<RecommendationsPageProps> => {
  const classes = useStyles()

  const [co2eUnit, setCo2eUnit] = useState(Co2eUnit.MetricTonnes)

  const recommendations = useRecommendationData({
    baseUrl: config.BASE_URL,
    onApiError,
    groupBy: config.GROUP_BY,
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
          />
        </Grid>
      </div>
    </div>
  )
}

export default RecommendationsPage
