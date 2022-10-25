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

export const useForecastData = (
  params: Map<string, string[]>,
): Map<string, OptimalTime[]> => {
  const baseUrl = `http://localhost:5073/emissions/forecasts/current`

  const promiseArray = []
  for (const parameter of params) {
    const promise = axios.get(
      `${baseUrl}?location=${parameter[1][0]}&windowSize=${parameter[1][1]}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
    promiseArray.push(promise)
  }

  const optimalDataPointArray = useRemoteForecastService(promiseArray)
  let index = 0
  const optimalTimeMap = new Map()
  for (const [key] of params) {
    optimalTimeMap.set(key, optimalDataPointArray[index++])
  }

  return optimalTimeMap
}
