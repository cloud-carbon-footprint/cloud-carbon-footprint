/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import React from 'react'
import { ServiceResult } from 'src/Types'

export interface ForecastResult {
  dataEndAt: string
  dataStartAt: string
  forecastData: LocationData[]
  generatedAt: string
  location: string
  optimalDataPoints: LocationData[]
  requestedAt: string
  windowSize: number
}
interface LocationData {
  duration: number
  location: string
  timestamp: string
  value: number
}

const useRemoteForecastService = (
  promiseList: Promise<any>[],
): ServiceResult<ForecastResult> => {
  const [data, setData] = React.useState<ForecastResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  useEffect(() => {
    const fetchOptimalDataPoints = async () => {
      try {
        const response = await Promise.all(promiseList)
        const optimalDataPointsArray = response.map((value) => {
          return value.data[0]
        })
        setData(optimalDataPointsArray)
        setLoading(false)
      } catch (e) {
        setError(e)
      }
    }
    fetchOptimalDataPoints()
    return () => {
      setLoading(false)
    }
  }, [])

  return { data, error, loading }
}

export default useRemoteForecastService
