export interface EstimationResult {
  readonly timestamp: Date
  readonly estimates: ServiceEstimate[]
}

interface ServiceEstimate {
  readonly serviceName: string
  readonly wattHours: number
  readonly co2e: number
}
