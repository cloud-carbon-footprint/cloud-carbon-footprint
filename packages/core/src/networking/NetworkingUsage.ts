/*
 * © 2021 Thoughtworks, Inc.
 */

import { IUsageData } from '../.'

export default interface NetworkingUsage extends IUsageData {
  readonly gigabytes: number
}
