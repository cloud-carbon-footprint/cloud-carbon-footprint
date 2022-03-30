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

      try {
        const res = await axios.get(`${params.baseUrl}/footprint`, {
          params: {
            start: start,
            end: end,
            region: params.region,
            ignoreCache: params.ignoreCache,
            groupBy: params.groupBy,
          },
        })
        setData(res.data)
      } catch (e) {
        setError(e)
      } finally {
        setTimeout(() => setLoading(false), params.minLoadTimeMs ?? 1000)
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
  ])

  return { data, loading, error }
}

export default useRemoteFootprintService
