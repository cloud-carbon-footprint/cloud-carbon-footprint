/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect } from 'react'
import React from 'react'

const useRemoteRegionRecommendationService = (params: any): any => {
  const [result, setResult] = React.useState<any>()
  useEffect(() => {
    const fetchBestLocation = async () => {
      const response = await Promise.all(params)
      setResult(
        response.map((res) => {
          return res.data
        }),
      )
    }
    fetchBestLocation()
  }, [])

  return result
}

export default useRemoteRegionRecommendationService
