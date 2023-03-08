import { EstimationResult } from '@cloud-carbon-footprint/common'
import { FilterResultResponse } from '../../Types'
import { EmissionsFilters } from '../../pages/EmissionsMetricsPage/EmissionsFilterBar/utils/EmissionsFilters'
import useRemoteFootprintService, {
  UseRemoteFootprintServiceParams,
} from './FootprintServiceHook'

export interface FootprintData {
  data: EstimationResult[]
  error: Error | null
  loading: boolean
}

export const useFootprintData = (
  params: UseRemoteFootprintServiceParams,
): FootprintData => {
  const { data, error, loading } = useRemoteFootprintService(params)

  return {
    data,
    error,
    loading,
  }
}

export const buildFilters = (filteredResponse: FilterResultResponse) => {
  const updatedConfig = EmissionsFilters.generateConfig(filteredResponse)
  return new EmissionsFilters(updatedConfig)
}
