/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import IUsageData from './IUsageData'

export default interface StorageUsage extends IUsageData {
  readonly terabyteHours: number
}
