/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../footprint'

export default interface MemoryUsage extends IUsageData {
  readonly gigabyteHours: number
}
