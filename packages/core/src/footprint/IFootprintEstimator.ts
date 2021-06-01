/*
 * © 2021 ThoughtWorks, Inc.
 */

import { CloudConstantsEmissionsFactors, CloudConstants } from '../cloud'
import { FootprintEstimate, IUsageData } from '.'

export default interface IFootprintEstimator {
  estimate(
    data: IUsageData[],
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): FootprintEstimate[]
}
