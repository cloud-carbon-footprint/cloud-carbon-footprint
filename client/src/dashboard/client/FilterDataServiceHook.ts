/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { FilterResultResponse } from '../../models/types'
import { useEffect, useState } from 'react'
import { useErrorHandling } from '../ErrorPage'
import axios from 'axios'

export const useFilterDataService = (): FilterResultResponse => {
  const [filterResultResponse, setFilterResultResponse] = useState({ accounts: [], services: [] })

  const { handleApiError, error, setError } = useErrorHandling()

  useEffect(() => {
    const fetchFilters = async () => {
      setError({})

      try {
        const res = await axios.get('/api/filters')
        setFilterResultResponse(res.data)
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
      }
    }
    fetchFilters()
  }, [])

  handleApiError(error)
  return filterResultResponse
}
