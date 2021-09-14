/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, SyntheticEvent, useState } from 'react'
import { Grid } from '@material-ui/core'
import { GridRowParams, MuiEvent } from '@material-ui/data-grid'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { useRemoteRecommendationsService } from 'utils/hooks'
import { FilterResultResponse, RecommendationRow } from 'Types'
import RecommendationsTable from './RecommendationsTable'
import useStyles from './recommendationsPageStyles'
import RecommendationsSidePanel from './RecommendationsSidePanel'
import LoadingMessage from 'common/LoadingMessage'
import RecommendationsFilterBar from './RecommendationsFilterBar/RecommendationsFilterBar'
import { useFilterDataFromRecommendations } from 'utils/helpers/transformData'
import { RecommendationsFilters } from './RecommendationsFilterBar/utils/RecommendationsFilters'
import useFilters from 'common/FilterBar/utils/FilterHook'

const RecommendationsPage = (): ReactElement => {
  const classes = useStyles()
  const { data, loading } = useRemoteRecommendationsService()
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationRow>()

  const filteredDataResults: FilterResultResponse =
    useFilterDataFromRecommendations(data)

  const buildFilters = (filteredResponse: FilterResultResponse) => {
    const updatedConfig =
      RecommendationsFilters.generateConfig(filteredResponse)
    return new RecommendationsFilters(updatedConfig)
  }

  const { filteredData, filters, setFilters } = useFilters(
    data,
    buildFilters,
    filteredDataResults,
  )

  const handleRowClick = (
    params: GridRowParams,
    _event: MuiEvent<SyntheticEvent>,
  ) => {
    setSelectedRecommendation(params.row as RecommendationRow)
  }

  const filteredRecommendationData = filteredData as RecommendationResult[]

  if (loading)
    return (
      <LoadingMessage
        message={'Loading recommendations. This may take a while...'}
      />
    )

  return (
    <>
      <RecommendationsFilterBar
        filters={filters}
        setFilters={setFilters}
        filteredDataResults={filteredDataResults}
      />
      <div className={classes.boxContainer}>
        <Grid container spacing={3}>
          {selectedRecommendation && (
            <RecommendationsSidePanel recommendation={selectedRecommendation} />
          )}
          <RecommendationsTable
            recommendations={filteredRecommendationData}
            handleRowClick={handleRowClick}
          />
        </Grid>
      </div>
    </>
  )
}

export default RecommendationsPage
