/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../footprint'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
}
