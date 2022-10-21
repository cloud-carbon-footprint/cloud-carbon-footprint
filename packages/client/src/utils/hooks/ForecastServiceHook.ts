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
      const res = await axios.get(
        `http://localhost:5073/emissions/forecasts/current?location=${params.location}&windowSize=${params.workLoadExecutionTime}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        },
      )
      if (res.status === 200) {
        setResult(res.data[0].optimalDataPoints)
      }
    }
    fetchOptimalDataPoints()
  }, [data])

  return result
}

export default useRemoteForecastService
