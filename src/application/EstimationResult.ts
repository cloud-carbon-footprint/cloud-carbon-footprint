export interface EstimationResult {
  readonly timestamp: Date
  readonly estimates: ServiceEstimate[]
}

export interface ServiceEstimate {
  readonly serviceName: string
  readonly wattHours: number
  readonly co2e: number
}
