/*
 * © 2021 Thoughtworks, Inc.
 */

import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceResult } from '../../Types'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAxiosErrorHandling } from '../../layout/ErrorPage'

export interface UseRemoteRecommendationServiceParams {
  baseUrl: string | null
  onApiError?: (e: Error) => void
  awsRecommendationTarget?: string
  minLoadTimeMs?: number
}

const useRemoteRecommendationsService = (
  params: UseRemoteRecommendationServiceParams,
): ServiceResult<RecommendationResult> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const { error, setError } = useAxiosErrorHandling(params.onApiError)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!params.baseUrl) {
        return
      }
      setError(null)
      setLoading(true)

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
        setTimeout(() => setLoading(false), params.minLoadTimeMs ?? 1000)
      }
    }

    fetchRecommendations()
  }, [params.awsRecommendationTarget, setError, params.baseUrl])

  return { data, loading, error }
}

export default useRemoteRecommendationsService
