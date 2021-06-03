/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../.'

export default interface StorageUsage extends IUsageData {
  readonly terabyteHours: number
}
