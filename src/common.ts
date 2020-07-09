
export const SSD_COEFFICIENT = 1.52

export interface FootprintEstimate {
  readonly timestamp: Date
  readonly wattage: number
  readonly co2: number
}

export interface FootprintEstimator {
  estimate(): FootprintEstimate[]
}

