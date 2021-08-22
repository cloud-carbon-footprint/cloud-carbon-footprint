/*
 * © 2021 Thoughtworks, Inc.
 */

import { IUsageData } from '../.'

export default interface UnknownUsage extends IUsageData {
  readonly cost: number
  readonly usageUnit: string
}
