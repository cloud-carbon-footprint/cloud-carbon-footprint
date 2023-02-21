import useRemoteForecastService from './ForecastServiceHook'
import axios from 'axios'

export interface RegionData {
  location: string
  workLoadExecutionTime: number
}

export interface OptimalTime {
  region: string
  location: string
  timestamp: string
  duration: number
  value: number
}
export interface DataResult<T> {
  result: T
  error: Error | null
  loading: boolean
}

export const useForecastData = (
  params: Map<string, string[]>,
): DataResult<Map<string, OptimalTime[]>> => {
  const baseUrl = process.env.REACT_APP_CARBON_AWARE_SDK_BASE_URL

  const promiseArray = []
  for (const parameter of params) {
    const promise = axios.get(
      `${baseUrl}/emissions/forecasts/current?location=${parameter[1][0]}&windowSize=${parameter[1][1]}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
    promiseArray.push(promise)
  }

  const { data, error, loading } = useRemoteForecastService(promiseArray)
  let index = 0
  const result = new Map()
  for (const [key] of params) {
    result.set(key, data[index++])
  }
  return { result, error, loading }
}
