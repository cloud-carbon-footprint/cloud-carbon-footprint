/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../footprintEstimator'

export default interface MemoryUsage extends IUsageData {
  readonly gigabyteHours: number
}
