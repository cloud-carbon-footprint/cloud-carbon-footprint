export interface EstimationResult {
  readonly timestamp: Date
  readonly serviceEstimates: ServiceData[]
}

export interface ServiceData {
  readonly serviceName: string
  readonly wattHours: number
  readonly co2e: number
  readonly cost: number
  readonly region: string
}
