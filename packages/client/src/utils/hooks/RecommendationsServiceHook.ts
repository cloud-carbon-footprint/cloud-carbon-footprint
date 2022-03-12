/*
 * © 2021 Thoughtworks, Inc.
 */

import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceResult } from '../../Types'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAxiosErrorHandling } from '../../layout/ErrorPage'

const useRemoteRecommendationsService = (
  awsRecommendationTarget?: string,
  baseUrl?: string,
  onApiError?: (e: Error) => void,
): ServiceResult<RecommendationResult> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const { error, setError } = useAxiosErrorHandling(onApiError)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!baseUrl) {
        return
      }
      setError()
      setLoading(true)

      try {
        const res = awsRecommendationTarget
          ? await axios.get(`${baseUrl}/recommendations`, {
              params: {
                awsRecommendationTarget,
              },
            })
          : await axios.get(`${baseUrl}/recommendations`)
        setData(res.data)
      } catch (e) {
        setError(e)
      } finally {
        setTimeout(() => setLoading(false), 1000)
      }
    }

    fetchRecommendations()
  }, [awsRecommendationTarget, setError, baseUrl])

  return { data, loading, error }
}

export default useRemoteRecommendationsService
