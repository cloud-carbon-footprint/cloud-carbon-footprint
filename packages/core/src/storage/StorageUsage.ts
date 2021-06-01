/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../footprint'

export default interface StorageUsage extends IUsageData {
  readonly terabyteHours: number
}
