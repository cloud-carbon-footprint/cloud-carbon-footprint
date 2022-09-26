/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { EstimationResult } from '@cloud-carbon-footprint/common'

import { useAxiosErrorHandling } from '../../layout/ErrorPage'
import { ServiceResult } from '../../Types'
import moment from 'moment'

export interface UseRemoteFootprintServiceParams {
  baseUrl: string | null
  startDate: moment.Moment
  endDate: moment.Moment
  initial?: EstimationResult[]
  ignoreCache?: boolean
  region?: string
  onApiError?: (e: Error) => void
  minLoadTimeMs?: number
  groupBy?: string
  limit?: number
}

const concatenateResults = (estimates, newEstimates) => {
  if (!newEstimates || !(newEstimates.length > 0)) {
    return estimates
  }

  const existingDates = estimates.reduce((dates, estimate) => {
    dates.push(moment.utc(estimate.timestamp))
    return dates
  }, [])

  let updatedEstimates
  newEstimates.map((newEstimate) => {
    const newDateExists = !!existingDates.find((date) => {
      return (
        new Date(date).getTime() == new Date(newEstimate.timestamp).getTime()
      )
    })

    if (newDateExists) {
      const elementIndex = estimates.findIndex((estimate) =>
        moment
          .utc(estimate.timestamp)
          .isSame(moment.utc(newEstimate.timestamp)),
      )
      const filteredEstimate = estimates[elementIndex]
      const concatenatedEstimates = filteredEstimate?.serviceEstimates.concat(
        newEstimate.serviceEstimates,
      )
      filteredEstimate.serviceEstimates = concatenatedEstimates
      estimates[elementIndex] = filteredEstimate
      updatedEstimates = estimates
    } else {
      updatedEstimates = estimates.concat([newEstimate])
    }
  })

  return updatedEstimates
}

const useRemoteFootprintService = (
  params: UseRemoteFootprintServiceParams,
): ServiceResult<EstimationResult> => {
  const [data, setData] = useState(params.initial ?? [])
  const [loading, setLoading] = useState(false)

  const { error, setError } = useAxiosErrorHandling(params.onApiError)

  const start: string = params.startDate.format('YYYY-MM-DD').toString()
  const end: string = params.endDate.format('YYYY-MM-DD').toString()

  useEffect(() => {
    const fetchEstimates = async () => {
      if (!params.baseUrl) {
        return
      }
      setError(null)
      setLoading(true)

      let estimates: EstimationResult[] = data
      try {
        let lastDataLength = 1
        let skip = 0
        while (lastDataLength > 0) {
          const res = await axios.get(`${params.baseUrl}/footprint`, {
            params: {
              start: start,
              end: end,
              region: params.region,
              ignoreCache: params.ignoreCache,
              groupBy: params.groupBy,
              limit: params.limit,
              skip,
            },
          })
          estimates = concatenateResults(estimates, res.data)
          lastDataLength = res.data.length

          if (params.ignoreCache) lastDataLength = 0
          skip += params.limit
        }
      } catch (e) {
        setError(e)
      } finally {
        setData(estimates)
        setTimeout(() => {
          setLoading(false)
        }, params.minLoadTimeMs ?? 1000)
      }
    }

    fetchEstimates()
  }, [
    end,
    start,
    params.region,
    params.ignoreCache,
    setError,
    params.baseUrl,
    params.groupBy,
    params.limit,
  ])

  return { data, loading, error }
}

export default useRemoteFootprintService
