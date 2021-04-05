/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import IUsageData from './IUsageData'
import FootprintEstimate from './FootprintEstimate'

export default interface IFootprintEstimator {
  estimate(
    data: IUsageData[],
    region: string,
    cloudProvider: string,
  ): FootprintEstimate[]
}
