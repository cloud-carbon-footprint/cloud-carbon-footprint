/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, SyntheticEvent, useState } from 'react'
import { Grid } from '@material-ui/core'
import { GridRowParams, MuiEvent } from '@material-ui/data-grid'
import { useRemoteRecommendationsService } from 'utils/hooks'
import { RecommendationRow } from 'Types'
import RecommendationsTable from './RecommendationsTable'
import useStyles from './recommendationsPageStyles'
import RecommendationsSidePanel from './RecommendationsSidePanel'
import LoadingMessage from 'common/LoadingMessage'

const RecommendationsPage = (): ReactElement => {
  const classes = useStyles()
  const { data, loading } = useRemoteRecommendationsService()
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationRow>()

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent<SyntheticEvent>,
  ) => {
    setSelectedRecommendation(params.row as RecommendationRow)
  }

  if (loading)
    return (
      <LoadingMessage
        message={'Loading recommendations. This may take a while...'}
      />
    )

  return (
    <div className={classes.boxContainer}>
      <Grid container spacing={3}>
        {selectedRecommendation && (
          <RecommendationsSidePanel recommendation={selectedRecommendation} />
        )}
        <RecommendationsTable
          recommendations={data}
          handleRowClick={handleRowClick}
        />
      </Grid>
    </div>
  )
}

export default RecommendationsPage
