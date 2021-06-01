/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../footprintEstimator'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
}
