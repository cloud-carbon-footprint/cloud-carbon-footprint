import {useEffect, useState} from 'react'
import axios from 'axios'

const useRemoteService = (initial: [], startTime: string, endTime: string) => {
    const [data, setData] = useState(initial)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchEstimates = async () => {
            setError(false)
            setLoading(true)

            try{
                const res = await axios.get('/api/footprint', {
                    params: {
                        start: startTime,
                        end: endTime
                    }
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
    }, [])

    return {data, loading, error}
}

export default useRemoteService