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

interface RecommendationsPageProps {
  onApiError?: (e: ErrorState) => void
  config?: ClientConfig
}

const RecommendationsPage = ({
  onApiError,
  config = loadConfig(),
}): ReactElement<RecommendationsPageProps> => {
  const classes = useStyles()

  const [useKilograms, setUseKilograms] = useState(false)

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
        setUseKilograms={setUseKilograms}
      />
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          <RecommendationsTable
            emissionsData={recommendations.filteredEmissionsData}
            recommendations={recommendations.filteredRecommendationData}
            useKilograms={useKilograms}
          />
        </Grid>
      </div>
    </div>
  )
}

export default RecommendationsPage
