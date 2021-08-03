/*
 * © 2021 Thoughtworks, Inc.
 */

import { RecommendationResult } from '@cloud-carbon-footprint/common'
import { ServiceResult } from 'Types'
import { useEffect, useState } from 'react'
import axios from 'axios'

const useRemoteRecommendationsService =
  (): ServiceResult<RecommendationResult> => {
    const [data, setData] = useState()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      setLoading(true)

      const fetchRecommendations = async () => {
        try {
          const res = await axios.get('/api/recommendations')
          setData(res.data)
        } catch (e) {
          console.log(e.message())
        } finally {
          setTimeout(() => setLoading(false), 1000)
        }
      }

      fetchRecommendations()
    }, [])

    return { data, loading }
  }

export default useRemoteRecommendationsService
