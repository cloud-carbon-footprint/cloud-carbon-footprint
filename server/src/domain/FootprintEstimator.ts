import UsageData from './UsageData'
import FootprintEstimate from './FootprintEstimate'

export default interface FootprintEstimator {
  estimate(data: UsageData[], region: string): FootprintEstimate[]
}
