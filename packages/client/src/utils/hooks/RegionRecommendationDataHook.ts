import axios from 'axios'
import useRemoteEmissionService from './RegionRecommendationServiceHook'

export interface BestLocationData {
  location: string
  carbonIntensity: number
}

export const useRegionRecommendationData = (params: Map<string, any>): any => {
  const baseUrl = 'http://localhost:5073'

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
  const bestLocationDataArray = useRemoteEmissionService(promiseArray)
  console.log(bestLocationDataArray, ' best location data array ')
  let index = 0
  const optimalLocationMap = new Map()
  if (bestLocationDataArray !== undefined) {
    for (const [key] of params) {
      let leastCarbonIntensity = Number.MAX_VALUE
      let leastCarbonIntensityIndex = 0
      for (let i = 0; i < bestLocationDataArray[index].length; i++) {
        const locationCarbonIntensity =
          bestLocationDataArray[index][i].carbonIntensity
        if (leastCarbonIntensity >= locationCarbonIntensity) {
          leastCarbonIntensity = locationCarbonIntensity
          leastCarbonIntensityIndex = i
        }
      }
      optimalLocationMap.set(
        key,
        bestLocationDataArray[index][leastCarbonIntensityIndex],
      )
      index++
    }
    console.log('Optimal location map ', optimalLocationMap)
  }
  return optimalLocationMap
}
