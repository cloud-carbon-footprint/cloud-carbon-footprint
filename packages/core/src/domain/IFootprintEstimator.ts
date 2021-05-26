/*
 * © 2021 ThoughtWorks, Inc.
 */

import IUsageData from './IUsageData'
import FootprintEstimate from './FootprintEstimate'

export default interface IFootprintEstimator {
  estimate(data: IUsageData[], region: string): FootprintEstimate[]
}
