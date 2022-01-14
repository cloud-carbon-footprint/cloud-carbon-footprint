/*
 * © 2021 Thoughtworks, Inc.
 */

import React, { ReactElement, SyntheticEvent, useState } from 'react'
import moment from 'moment'
import { Grid } from '@material-ui/core'
import { GridRowParams, MuiEvent } from '@material-ui/data-grid'
import { useRemoteRecommendationsService, useRemoteService } from 'utils/hooks'
import {
  EmissionsAndRecommendationResults,
  FilterResultResponse,
  RecommendationRow,
} from 'Types'
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
  const [useKilograms, setUseKilograms] = useState(false)

  // Emissions Estimation Data
  const endDate: moment.Moment = moment.utc()
  const startDate = moment.utc().subtract('1', 'month')
  const { data: emissions, loading: emissionsLoading } = useRemoteService(
    [],
    startDate,
    endDate,
    true,
  )

  const combinedData: EmissionsAndRecommendationResults = {
    recommendations,
    emissions: emissions.flatMap(
      (estimationResult) => estimationResult.serviceEstimates,
    ),
  }

  const isEmissionsDataLoaded = combinedData.emissions.length > 0
  const filteredDataResults: FilterResultResponse =
    useFilterDataFromRecommendations(combinedData)

  const buildFilters = (filteredResponse: FilterResultResponse) => {
    const updatedConfig =
      RecommendationsFilters.generateConfig(filteredResponse)
    return new RecommendationsFilters(updatedConfig)
  }

  const { filteredData, filters, setFilters } = useFilters(
    combinedData,
    buildFilters,
    filteredDataResults,
    isEmissionsDataLoaded,
  )

  const {
    recommendations: filteredRecommendationData,
    emissions: filteredEmissionsData,
  } = filteredData as EmissionsAndRecommendationResults

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
            emissionsData={filteredEmissionsData}
            recommendations={filteredRecommendationData}
            handleRowClick={handleRowClick}
            useKilograms={useKilograms}
          />
        </Grid>
      </div>
    </>
  )
}

export default RecommendationsPage
