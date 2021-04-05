/*
 * © 2021 Thoughtworks, Inc. All rights reserved.
 */

import IUsageData from './IUsageData'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
}
