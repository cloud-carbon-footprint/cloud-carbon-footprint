/*
 * © 2021 ThoughtWorks, Inc.
 */

import IUsageData from './IUsageData'

export default interface MemoryUsage extends IUsageData {
  readonly gigabyteHours?: number // GCP
  readonly gigabytes?: number // AWS
  readonly numberOfvCpus?: number // AWS
}
