import { EstimationResult } from '@cloud-carbon-footprint/common'
import {
  FilterBarProps,
  FilterOptions,
  FilterResultResponse,
} from '../../Types'
import { useFilterDataFromEstimates } from '../helpers'
import { EmissionsFilters } from '../../pages/EmissionsMetricsPage/EmissionsFilterBar/utils/EmissionsFilters'
import useFilters from '../../common/FilterBar/utils/FilterHook'
import useRemoteFootprintService, {
  UseRemoteFootprintServiceParams,
} from './FootprintServiceHook'

interface FootprintData {
  data: EstimationResult[]
  filteredData: EstimationResult[]
  filterBarProps: FilterBarProps
  error: Error | null
  loading: boolean
}

export const useFootprintData = (
  params: UseRemoteFootprintServiceParams,
): FootprintData => {
  const { data, error, loading } = useRemoteFootprintService(params)

  const filterOptions: FilterResultResponse = useFilterDataFromEstimates(data)

  const { filteredData, filters, setFilters } = useFilters(
    data,
    buildFilters,
    filterOptions,
  )

  return {
    data,
    filteredData: filteredData as EstimationResult[],
    error,
    loading,
    filterBarProps: {
      filterOptions: filterOptions as unknown as FilterOptions,
      filters,
      setFilters,
    },
  }
}

const buildFilters = (filteredResponse: FilterResultResponse) => {
  const updatedConfig = EmissionsFilters.generateConfig(filteredResponse)
  return new EmissionsFilters(updatedConfig)
}
