/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, SyntheticEvent, useState } from 'react'
import moment from 'moment'
import { Grid } from '@material-ui/core'
import { GridRowParams, MuiEvent } from '@material-ui/data-grid'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { useRemoteRecommendationsService, useRemoteService } from 'utils/hooks'
import { FilterResultResponse, RecommendationRow } from 'Types'
import LoadingMessage from 'common/LoadingMessage'
import { useFilterDataFromRecommendations } from 'utils/helpers/transformData'
import useFilters from 'common/FilterBar/utils/FilterHook'
import RecommendationsTable from './RecommendationsTable'
import useStyles from './recommendationsPageStyles'
import RecommendationsSidePanel from './RecommendationsSidePanel'
import RecommendationsFilterBar from './RecommendationsFilterBar'
import { RecommendationsFilters } from './RecommendationsFilterBar/utils/RecommendationsFilters'

const RecommendationsPage = (): ReactElement => {
  const classes = useStyles()

  // Recommendation Data
  const { data: recommendations, loading: recommendationsLoading } =
    useRemoteRecommendationsService()
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<RecommendationRow>()

  // Emissions Estimation Data
  const endDate: moment.Moment = moment.utc()
  const startDate = moment.utc().subtract('1', 'year')
  const { data: emissions, loading: emissionsLoading } = useRemoteService(
    [],
    startDate,
    endDate,
  )

  const filteredDataResults: FilterResultResponse =
    useFilterDataFromRecommendations(recommendations)

  const buildFilters = (filteredResponse: FilterResultResponse) => {
    const updatedConfig =
      RecommendationsFilters.generateConfig(filteredResponse)
    return new RecommendationsFilters(updatedConfig)
  }

  const { filteredData, filters, setFilters } = useFilters(
    recommendations,
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

  if (recommendationsLoading || emissionsLoading)
    return (
      <LoadingMessage message="Loading recommendations. This may take a while..." />
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
            emissionsData={emissions}
            recommendations={filteredRecommendationData}
            handleRowClick={handleRowClick}
          />
        </Grid>
      </div>
    </>
  )
}

export default RecommendationsPage
