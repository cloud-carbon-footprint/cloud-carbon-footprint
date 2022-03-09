/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { EmissionRatioResult } from '@cloud-carbon-footprint/common'
import { useErrorHandling } from '../../layout/ErrorPage'

import { ServiceResult } from '../../Types'

const useRemoteEmissionService = (
  baseUrl?: string,
): ServiceResult<EmissionRatioResult> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const _isMounted = useRef(true)
  const { handleApiError, error, setError } = useErrorHandling()

  useEffect(() => {
    const fetchEstimates = async () => {
      if (!baseUrl) {
        return
      }
      setError({})
      if (_isMounted.current) {
        setLoading(true)
      }

      try {
        const res = await axios.get(`${baseUrl}/regions/emissions-factors`)

        if (_isMounted.current) {
          setData(res.data)
        }
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
        if (_isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchEstimates()
    return () => {
      _isMounted.current = false
    }
  }, [setError, baseUrl])

  handleApiError(error)

  return { data, loading }
}

export default useRemoteEmissionService
