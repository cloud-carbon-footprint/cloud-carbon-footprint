/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { EmissionRatioResult } from '@cloud-carbon-footprint/common'
import { useAxiosErrorHandling } from '../../layout/ErrorPage'

import { ServiceResult } from '../../Types'

interface UseRemoteEmissionServiceParams {
  baseUrl: string | null
  onApiError?: (e: Error) => void
}
const useRemoteEmissionService = (
  params: UseRemoteEmissionServiceParams,
): ServiceResult<EmissionRatioResult> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const _isMounted = useRef(true)
  const { error, setError } = useAxiosErrorHandling(params.onApiError)

  useEffect(() => {
    const fetchEstimates = async () => {
      if (!params.baseUrl) {
        return
      }
      if (_isMounted.current) {
        setError(null)
        setLoading(true)
      }

      try {
        const res = await axios.get(
          `${params.baseUrl}/regions/emissions-factors`,
        )

        if (_isMounted.current) {
          setData(res.data)
        }
      } catch (e) {
        console.error(e.message, e)
        setError(e)
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
  }, [setError, params.baseUrl])

  return { data, loading, error }
}

export default useRemoteEmissionService
