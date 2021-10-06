/*
 * © 2021 Thoughtworks, Inc.
 */

import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceResult } from 'Types'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useErrorHandling } from 'layout/ErrorPage'

const useRemoteRecommendationsService = (
  awsRecommendationTarget?: string,
): ServiceResult<RecommendationResult> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const { handleApiError, error, setError } = useErrorHandling()

  useEffect(() => {
    const fetchRecommendations = async () => {
      setError({})
      setLoading(true)

      try {
        const res = awsRecommendationTarget
          ? await axios.get('/api/recommendations', {
              params: {
                awsRecommendationTarget,
              },
            })
          : await axios.get('/api/recommendations')
        setData(res.data)
      } catch (e) {
        const DEFAULT_RESPONSE = {
          status: '520',
          statusText: 'Unknown Error',
        }
        if (e.response) {
          const { status, statusText } = e.response
          setError({ status, statusText })
        } else {
          setError(DEFAULT_RESPONSE)
        }
      } finally {
        setTimeout(() => setLoading(false), 1000)
      }
    }

    fetchRecommendations()
  }, [awsRecommendationTarget, setError])

  handleApiError(error)

  return { data, loading }
}

export default useRemoteRecommendationsService
