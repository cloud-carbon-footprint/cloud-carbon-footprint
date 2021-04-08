/*
 * © 2021 ThoughtWorks, Inc.
 */

import IUsageData from './IUsageData'

export default interface StorageUsage extends IUsageData {
  readonly terabyteHours: number
}
