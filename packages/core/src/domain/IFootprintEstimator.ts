/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  CloudConstantsEmissionsFactors,
  CloudConstantsUsage,
  FootprintEstimate,
  IUsageData,
} from '.'

export default interface IFootprintEstimator {
  estimate(
    data: IUsageData[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstantsUsage,
  ): FootprintEstimate[]
}
