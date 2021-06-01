/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../footprintEstimator'

export default interface StorageUsage extends IUsageData {
  readonly terabyteHours: number
}
