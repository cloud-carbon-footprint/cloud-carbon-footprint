export interface serviceEstimate{
    timestamp: Date,
    serviceName: string,
    wattHours: number,
    co2e: number,
    cost: number
}

export interface EstimationResult{
    timestamp:Date,
    serviceEstimates: serviceEstimate[]
}

export interface co2PerDay{
    x: Date,
    y: number
}
