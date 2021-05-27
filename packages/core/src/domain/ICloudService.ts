/*
 * © 2021 ThoughtWorks, Inc.
 */

import FootprintEstimate from './FootprintEstimate'
import Cost from './Cost'
import { CloudConstantsEmissionsFactors } from './FootprintEstimationConstants'
import CloudConstantsUsage from './CloudConstantsUsage'

export default interface ICloudService {
  serviceName: string
  getEstimates(
    start: Date,
    end: Date,
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstantsUsage,
  ): Promise<FootprintEstimate[]>
  getCosts(start: Date, end: Date, region: string): Promise<Cost[]>
}
