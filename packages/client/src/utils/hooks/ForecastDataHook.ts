import useRemoteForecastService from './ForecastServiceHook'
export interface RegionData {
  location: string
  workLoadExecutionTime: number
}
export interface OptimalTime {
  location: string
  timestamp: string
  duration: number
  value: number
}

export const useForecastData = (params: RegionData): OptimalTime[] => {
  const data: OptimalTime[] = useRemoteForecastService(params)
  return data
}
