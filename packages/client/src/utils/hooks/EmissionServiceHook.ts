/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'
import { BestLocationData } from './EmissionDataHook'
import { EmissionData } from './EmissionDataHook'
import React from 'react'

const useRemoteEmissionService = (params: EmissionData): BestLocationData[] => {
  const [data, setData] = useState(params ?? {})
  const [result, setResult] = React.useState<BestLocationData[]>([])
  useEffect(() => {
    const fetchBestLocationRating = async () => {
      let locationQueryParams = ''
      params.location.map((location, index) => {
        if (index == params.location.length - 1) {
          locationQueryParams += `location=${location}`
        } else {
          locationQueryParams += `location=${location}&`
        }
      })

      const res = await axios.get(
        `http://localhost:5073/emissions/bylocations/best?${locationQueryParams}&time=${params.time}&toTime=${params.toTime}`,
      )
      if (res.status === 200) {
        setResult(
          res.data.map((each) => {
            return {
              location: each.location,
              rating: each.rating,
            }
          }),
        )
      }
    }
    fetchBestLocationRating()
  }, [data])

  return result
}

export default useRemoteEmissionService
