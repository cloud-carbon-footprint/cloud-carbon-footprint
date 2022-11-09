/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect } from 'react'
import React from 'react'
import { OptimalTime } from './ForecastDataHook'

const useRemoteForecastService = (
  promiseList: Promise<any>[],
): OptimalTime[] => {
  const [result, setResult] = React.useState([])
  useEffect(() => {
    const fetchOptimalDataPoints = async () => {
      const response = await Promise.all(promiseList)
      const optimalDataPointsArray = response.map((value) => {
        return value.data[0]
      })
      setResult(optimalDataPointsArray)
    }

    fetchOptimalDataPoints()
  }, [])

  return result
}

export default useRemoteForecastService
