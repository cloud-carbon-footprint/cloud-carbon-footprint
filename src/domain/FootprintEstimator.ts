export default interface FootprintEstimator {
  estimate(data: UsageData[]): FootprintEstimate[]
}
