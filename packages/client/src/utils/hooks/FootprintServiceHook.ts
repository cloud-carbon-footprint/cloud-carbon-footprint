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
        let lastDate = moment.utc(start)
        const endDate = moment.utc(end)
        let skip = 0
        while (
          !lastDate.isSame(endDate, params.groupBy as moment.unitOfTime.StartOf)
        ) {
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
          estimates = estimates.concat(res.data)
          // TODO: Clean up exit condition for last date into single if-statement. If empty response or ignoreCache is true, we should exit.
          lastDate =
            moment.utc(res.data[res.data.length - 1]?.timestamp) ?? endDate
          if (params.ignoreCache) lastDate = endDate
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
