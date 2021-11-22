/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'

import { EstimationResult } from '@cloud-carbon-footprint/common'

import { useErrorHandling } from 'layout/ErrorPage'

export interface QueueResult<T> {
  data: T[]
  loading: { queue: boolean; data: boolean }
}

const useRemoteService = (
  initial: EstimationResult[],
  startDate: moment.Moment,
  endDate: moment.Moment,
  ignoreCache = false,
  region?: string,
): QueueResult<EstimationResult> => {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState({ queue: false, data: false })

  const { handleApiError, error, setError } = useErrorHandling()

  const start: string = startDate.format('YYYY-MM-DD').toString()
  const end: string = endDate.format('YYYY-MM-DD').toString()

  useEffect(() => {
    const queueEstimates = async () => {
      setError({})
      setLoading({ ...loading, queue: true })

      try {
        const res = await axios.get('/api/queue-footprint', {
          params: {
            start: start,
            end: end,
            region: region,
            ignoreCache,
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
        setTimeout(() => setLoading({ queue: false, data: true }), 1000)
      }
    }

    const checkEstimates = async () => {
      console.log('Made it here')
      setTimeout(async () => {
        if (loading.data) {
          try {
            const res = await axios.get('/api/status-footprint')
            setData(res.data)
            if (res.data === 'finished') {
              setLoading({ ...loading, data: false })
            }
          } catch (error) {
            console.log(error.response)
          }
        } else {
          return
        }
      }, 15000)
    }

    queueEstimates().then(() => checkEstimates())
  }, [end, start, region, ignoreCache, setError])

  handleApiError(error)

  return { data, loading }
}

export default useRemoteService
