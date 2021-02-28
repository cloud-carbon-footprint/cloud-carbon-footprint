/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import IUsageData from './IUsageData'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
}
