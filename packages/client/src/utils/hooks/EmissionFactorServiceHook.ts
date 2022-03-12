/*
 * © 2021 Thoughtworks, Inc.
 */

import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { EmissionRatioResult } from '@cloud-carbon-footprint/common'
import { useAxiosErrorHandling } from '../../layout/ErrorPage'

import { ServiceResult } from '../../Types'

const useRemoteEmissionService = (
  baseUrl: string | undefined,
  onApiError?: (e: Error) => void,
): ServiceResult<EmissionRatioResult> => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const _isMounted = useRef(true)
  const { error, setError } = useAxiosErrorHandling(onApiError)

  useEffect(() => {
    const fetchEstimates = async () => {
      if (!baseUrl) {
        return
      }
      if (_isMounted.current) {
        setError()
        setLoading(true)
      }

      try {
        const res = await axios.get(`${baseUrl}/regions/emissions-factors`)

        if (_isMounted.current) {
          setData(res.data)
        }
      } catch (e) {
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
  }, [setError, baseUrl])

  return { data, loading, error }
}

export default useRemoteEmissionService
