/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'
import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceResult } from '../../Types'
import { useAxiosErrorHandling } from '../../layout/ErrorPage'
import { FootprintData } from './FootprintDataHook'
import { sliceFootprintDataByLastMonth } from '../helpers/handleDates'
export interface UseRemoteRecommendationServiceParams {
  baseUrl: string | null
  onApiError?: (e: Error) => void
  awsRecommendationTarget?: string
  minLoadTimeMs?: number
  footprint?: FootprintData
}

const useRemoteRecommendationsService = (
  params: UseRemoteRecommendationServiceParams,
): ServiceResult<RecommendationResult> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const { error, setError } = useAxiosErrorHandling(params.onApiError)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!params.baseUrl) {
        setLoading(false)
        return
      }
      setError(null)

      params.footprint.data = sliceFootprintDataByLastMonth(
        params.footprint.data,
      )

      try {
        const res = params.awsRecommendationTarget
          ? await axios.get(`${params.baseUrl}/recommendations`, {
              params: {
                awsRecommendationTarget: params.awsRecommendationTarget,
              },
            })
          : await axios.get(`${params.baseUrl}/recommendations`)
        setData(res.data)
      } catch (e) {
        console.error(e.message, e)
        setError(e)
      } finally {
        if (params.minLoadTimeMs) {
          setTimeout(() => setLoading(false), params.minLoadTimeMs)
        } else {
          setLoading(false)
        }
      }
    }

    fetchRecommendations()
  }, [params.awsRecommendationTarget, setError, params.baseUrl])

  return { data, loading, error }
}

export default useRemoteRecommendationsService
