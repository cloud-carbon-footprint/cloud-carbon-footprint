export interface serviceEstimate {
  serviceName: string
  wattHours: number
  co2e: number
  cost: number
  region: string
}

export interface ServiceResult {
  data: EstimationResult[]
  loading: boolean
  error: boolean
}

export interface EstimationResult {
  timestamp: Date
  serviceEstimates: serviceEstimate[]
}

export interface cloudEstPerDay {
  x: Date
  y: number
}

export enum CloudEstimationTypes {
  co2e = 'co2e',
  wattHours = 'wattHours',
  cost = 'cost',
}
