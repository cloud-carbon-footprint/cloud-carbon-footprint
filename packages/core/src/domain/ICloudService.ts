/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import FootprintEstimate from './FootprintEstimate'
import Cost from './Cost'

export default interface ICloudService {
  serviceName: string
  getEstimates(start: Date, end: Date, region: string, cloudProvider: string): Promise<FootprintEstimate[]>
  getCosts(start: Date, end: Date, region: string): Promise<Cost[]>
}
