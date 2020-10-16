export interface serviceEstimate {
  serviceName: string
  wattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant?: boolean
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
  usesAverageCPUConstant?: boolean
  wattHours?: number
  cost?: number
}

export enum ChartDataTypes {
  REGION = 'region',
  SERVICE = 'service',
}
