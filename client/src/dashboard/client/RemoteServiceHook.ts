/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useErrorHandling } from '../ErrorPage'

import { EstimationResult, ServiceResult } from '../../models/types'

const useRemoteService = (
  initial: EstimationResult[],
  startDate: moment.Moment,
  endDate: moment.Moment,
  region?: string,
): ServiceResult => {
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
        setLoading(false)
      }
    }

    fetchEstimates()
  }, [end, start, region, setError])

  handleApiError(error)

  return { data, loading }
}

export default useRemoteService
