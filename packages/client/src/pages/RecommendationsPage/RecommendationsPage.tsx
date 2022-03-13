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

const BASE_URL = '/api'

interface RecommendationsPageProps {
  onApiError?: (e: ErrorState) => void
}

const RecommendationsPage = ({
  onApiError,
}): ReactElement<RecommendationsPageProps> => {
  const classes = useStyles()

  const [useKilograms, setUseKilograms] = useState(false)

  const recommendations = useRecommendationData({
    baseUrl: BASE_URL,
    onApiError,
  })

  if (recommendations.loading)
    return (
      <LoadingMessage message="Loading recommendations. This may take a while..." />
    )

  return (
    <>
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
    </>
  )
}

export default RecommendationsPage
