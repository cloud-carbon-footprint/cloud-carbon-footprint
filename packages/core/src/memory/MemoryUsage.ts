/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../.'

export default interface MemoryUsage extends IUsageData {
  readonly gigabyteHours: number
}
