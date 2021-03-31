/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useErrorHandling } from '../ErrorPage'

import { EmissionsRatios, ServiceResult } from '../../models/types'

const useRemoteEmissionService = (): ServiceResult<EmissionsRatios> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const { handleApiError, error, setError } = useErrorHandling()

  useEffect(() => {
    const fetchEstimates = async () => {
      setError({})
      setLoading(true)

      try {
        const res = await axios.get('/api/regions/emissions-factors')
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
  }, [setError])

  handleApiError(error)

  return { data, loading }
}

export default useRemoteEmissionService
