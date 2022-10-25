import useRemoteEmissionService from './EmissionServiceHook'
export interface EmissionData {
  location: string[]
  time: string
  toTime: string
}

export interface BestLocationData {
  location: string
  rating: number
}

export const useEmissionsData = (params: EmissionData): BestLocationData[] => {
  const data: BestLocationData[] = useRemoteEmissionService(params)
  return data
}
