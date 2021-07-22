/*
 * © 2021 Thoughtworks, Inc.
 */

import { IUsageData } from '../.'

export default interface MemoryUsage extends IUsageData {
  readonly gigabyteHours: number
}
