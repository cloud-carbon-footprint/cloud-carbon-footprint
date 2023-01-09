import { useMemo } from 'react'
import {
  RecommendationResult,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import { useRemoteRecommendationsService } from './index'
import {
  EmissionsAndRecommendationResults,
  FilterBarProps,
  FilterOptions,
  FilterResultResponse,
} from '../../Types'
import { useFilterDataFromRecommendations } from '../helpers/transformData'
import { RecommendationsFilters } from '../../pages/RecommendationsPage/RecommendationsFilterBar/utils/RecommendationsFilters'
import useFilters from '../../common/FilterBar/utils/FilterHook'
import { UseRemoteRecommendationServiceParams } from './RecommendationsServiceHook'

interface RecommendationsData {
  loading: boolean
  error: Error | null
  filterBarProps: FilterBarProps
  filteredEmissionsData: ServiceData[]
  filteredRecommendationData: RecommendationResult[]
}

export const useRecommendationData = (
  params: UseRemoteRecommendationServiceParams & { groupBy?: string },
): RecommendationsData => {
  const recommendations = useRemoteRecommendationsService(params)

  const combinedData: EmissionsAndRecommendationResults = useMemo(
    () => ({
      recommendations: recommendations.data,
      emissions: params.footprint.data.flatMap(
        (estimationResult) => estimationResult.serviceEstimates,
      ),
    }),
    [recommendations.data, params.footprint.data],
  )

  const filterOptions: FilterResultResponse =
    useFilterDataFromRecommendations(combinedData)

  const { filteredData, filters, setFilters } = useFilters(
    combinedData,
    buildFilters,
    filterOptions,
    combinedData.emissions.length > 0,
  )

  const {
    recommendations: filteredRecommendationData,
    emissions: filteredEmissionsData,
  } = filteredData as EmissionsAndRecommendationResults

  return {
    loading: recommendations.loading || params.footprint.loading,
    error: recommendations.error || params.footprint.error,
    filterBarProps: {
      filters,
      setFilters,
      filterOptions: filterOptions as unknown as FilterOptions,
    },
    filteredEmissionsData: filteredEmissionsData,
    filteredRecommendationData: filteredRecommendationData,
  }
}

const buildFilters = (filteredResponse: FilterResultResponse) => {
  const updatedConfig = RecommendationsFilters.generateConfig(filteredResponse)
  return new RecommendationsFilters(updatedConfig)
}
