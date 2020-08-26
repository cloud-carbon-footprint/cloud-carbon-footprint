import {useEffect, useState} from 'react'
import axios from 'axios'

const useRemoteService = (initial: []) => {
    const [data, setData] = useState(initial)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    // useEffect(() => {
    //     const fetchEstimates = () => {
    //         setError(false)
    //         setLoading(true)

    //         try{
    //             const res = await axios.get('http://localhost:4000/api')
    //             console.log(res.data)
    //             setData(res.data)
    //         } catch (e) {
    //             setError(true)
    //         } finally {
    //             setLoading(false)
    //         }
    //     }

    //     fetchEstimates()
    // }, [])

    return {data, loading, error}
}

export default useRemoteService