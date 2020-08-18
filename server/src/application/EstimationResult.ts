export interface EstimationResult {
  readonly timestamp: Date
  readonly serviceEstimates: ServiceEstimate[]
}

export interface ServiceEstimate {
  readonly timestamp: Date
  readonly serviceName: string
  readonly wattHours: number
  readonly co2e: number
  readonly cost: number
}
