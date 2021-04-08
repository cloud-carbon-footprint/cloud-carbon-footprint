/*
 * © 2021 ThoughtWorks, Inc.
 */

import IUsageData from './IUsageData'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
}
