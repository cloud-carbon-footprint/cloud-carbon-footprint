/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  FootprintEstimate,
  IUsageData,
  CloudConstantsEmissionsFactors,
  CloudConstants,
} from '.'

export default interface IFootprintEstimator {
  estimate(
    data: IUsageData[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[]
}
