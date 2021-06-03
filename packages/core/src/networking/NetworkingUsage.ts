/*
 * © 2021 ThoughtWorks, Inc.
 */

import { IUsageData } from '../.'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
}
