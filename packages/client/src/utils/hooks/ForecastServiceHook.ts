/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'
import React from 'react'
import { RegionData, OptimalTime } from './ForecastDataHook'
const useRemoteForecastService = (params: RegionData): OptimalTime[] => {
  const [data, setData] = useState(params ?? {})
  const [result, setResult] = React.useState<OptimalTime[]>([])
  useEffect(() => {
    const fetchOptimalDataPoints = async () => {
      const response = await Promise.all(promiseList)
      const optimalDataPointsArray = response.map((value) => {
        return value.data[0]
      })
      setResult(optimalDataPointsArray)
    }

    fetchOptimalDataPoints()
  }, [data])

  return result
}

export default useRemoteForecastService
