/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { EstimationResult } from '@cloud-carbon-footprint/common'

import { useErrorHandling } from '../../layout/ErrorPage'
import { ServiceResult } from '../../Types'

const useRemoteService = (
  initial: EstimationResult[],
  startDate: moment.Moment,
  endDate: moment.Moment,
  region?: string,
): ServiceResult<EstimationResult> => {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(false)

  const { handleApiError, error, setError } = useErrorHandling()

  const start: string = startDate.format('YYYY-MM-DD').toString()
  const end: string = endDate.format('YYYY-MM-DD').toString()

  useEffect(() => {
    const fetchEstimates = async () => {
      setError({})
      setLoading(true)

      try {
        const res = await axios.get('/api/footprint', {
          params: {
            start: start,
            end: end,
            region: region,
          },
        })
        setData(res.data)
      } catch (e) {
        const DEFAULT_RESPONSE = {
          status: '520',
          statusText: 'Unknown Error',
        }

        if (e.response) {
          const { status, statusText } = e.response
          setError({ status, statusText })
        } else {
          setError(DEFAULT_RESPONSE)
        }
      } finally {
        setTimeout(() => setLoading(false), 1000)
      }
    }

    fetchEstimates()
  }, [end, start, region, setError])

  handleApiError(error)

  return { data, loading }
}

export default useRemoteService
