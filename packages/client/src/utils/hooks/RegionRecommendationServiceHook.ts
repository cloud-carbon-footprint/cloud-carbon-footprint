/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect } from 'react'
import React from 'react'
import { BestLocationData } from './RegionRecommendationDataHook'
import { ServiceResult } from 'src/Types'

const useRemoteRegionRecommendationService = (
  params: any,
): ServiceResult<BestLocationData[]> => {
  const [data, setData] = React.useState<BestLocationData[][]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<Error>(null)
  useEffect(() => {
    const fetchBestLocation = async () => {
      try {
        const response = await Promise.all(params)
        setData(
          response.map((res) => {
            return res.data
          }),
        )
        setLoading(false)
      } catch (e) {
        setError(e)
      }
    }
    fetchBestLocation()
    return () => {
      setLoading(false)
    }
  }, [])
  return { data, error, loading }
}

export default useRemoteRegionRecommendationService
