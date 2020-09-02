import { useEffect, useState } from 'react'
import axios from 'axios'
import { EstimationResult, ServiceResult } from '../types'

const useRemoteService = (
  initial: EstimationResult[],
  startDate: moment.Moment,
  endDate: moment.Moment,
  region: string,
): ServiceResult => {
  const [data, setData] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const start: string = startDate.format('YYYY-MM-DD').toString()
  const end: string = endDate.format('YYYY-MM-DD').toString()

  useEffect(() => {
    const fetchEstimates = async () => {
      setError(false)
      setLoading(true)

      try {
        const res = await axios.get('/api/footprint', {
          params: {
            start: start,
            end: end,
            region: region,
          },
        })
        console.log(res.data)
        setData(res.data)
      } catch (e) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchEstimates()
  }, [end, start])

  return { data, loading, error }
}

export default useRemoteService
