import axios from 'axios'
import { DataResult } from './ForecastDataHook'
import useRemoteEmissionService from './RegionRecommendationServiceHook'

export interface BestLocationData {
  location: string
  startTime: string
  endTime: string
  carbonIntensity: number
}

export const useRegionRecommendationData = (
  params: Map<string, any>,
): DataResult<Map<string, any>> => {
  const baseUrl = process.env.REACT_APP_CARBON_AWARE_SDK_BASE_URL

  const promiseArray = []
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [accountName, accountData] of params) {
    const requestBody = accountData[4].map((nearestLocation) => {
      return {
        location: nearestLocation,
        startTime: accountData[5],
        endTime: accountData[6],
      }
    })
    const res = axios.post(
      `${baseUrl}/emissions/average-carbon-intensity/batch`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
    promiseArray.push(res)
  }
  const { data, error, loading } = useRemoteEmissionService(promiseArray)
  let index = 0
  const result = new Map()
  if (data != undefined && data.length > 0) {
    for (const [key] of params) {
      let leastCarbonIntensity = Number.MAX_VALUE
      let leastCarbonIntensityIndex = 0
      for (let i = 0; i < data[index].length; i++) {
        const locationCarbonIntensity = data[index][i].carbonIntensity
        if (leastCarbonIntensity >= locationCarbonIntensity) {
          leastCarbonIntensity = locationCarbonIntensity
          leastCarbonIntensityIndex = i
        }
      }
      result.set(key, data[index][leastCarbonIntensityIndex])
      index++
    }
  }
  console.log(result, 'Result')

  return { result, error, loading }
}
