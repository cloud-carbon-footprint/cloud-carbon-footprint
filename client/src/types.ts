export interface serviceEstimate {
  timestamp: Date
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

export interface RegionResult {
  readonly region: string
  readonly serviceResults: Service[]
}

export interface Service {
  readonly serviceName: string
  readonly estimationResults: EstimationResult[]
}

export interface ServiceUsage {
  readonly timestamp: Date
  readonly serviceData: CostAndUsageData[]
}

export interface CostAndUsageData {
  readonly wattHours: number
  readonly co2e: number
  readonly cost: number
}


export interface EstimationResult {
  timestamp: Date
  serviceEstimates: serviceEstimate[]
}

export interface co2PerDay {
  x: Date
  y: number
}
