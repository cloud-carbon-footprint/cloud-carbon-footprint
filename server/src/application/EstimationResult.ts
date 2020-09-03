export interface RegionResult {
  readonly region: string
  readonly serviceResults: ServiceResult[]
}

export interface ServiceResult {
  readonly serviceName: string
  readonly estimationResults: EstimationResult[]
}

export interface EstimationResult {
  readonly timestamp: Date
  readonly serviceData: CostAndUsageData[]
}

export interface CostAndUsageData {
  readonly wattHours: number
  readonly co2e: number
  readonly cost: number
}
