/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, SyntheticEvent, useState } from 'react'
import { Grid } from '@material-ui/core'
import { GridRowParams, MuiEvent } from '@material-ui/data-grid'

import { RecommendationRow } from '../../Types'
import LoadingMessage from '../../common/LoadingMessage'
import RecommendationsTable from './RecommendationsTable'
import useStyles from './recommendationsPageStyles'
import RecommendationsSidePanel from './RecommendationsSidePanel'
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
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationRow>()
  const [useKilograms, setUseKilograms] = useState(false)

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent<SyntheticEvent>,
  ) => {
    if (selectedRecommendation && params.row.id === selectedRecommendation.id) {
      setSelectedRecommendation(undefined)
    } else {
      setSelectedRecommendation(params.row as RecommendationRow)
    }
  }

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
          {selectedRecommendation && (
            <RecommendationsSidePanel
              recommendation={selectedRecommendation}
              onClose={() => setSelectedRecommendation(undefined)}
            />
          )}
          <RecommendationsTable
            emissionsData={recommendations.filteredEmissionsData}
            recommendations={recommendations.filteredRecommendationData}
            handleRowClick={handleRowClick}
            useKilograms={useKilograms}
          />
        </Grid>
      </div>
    </>
  )
}

export default RecommendationsPage
