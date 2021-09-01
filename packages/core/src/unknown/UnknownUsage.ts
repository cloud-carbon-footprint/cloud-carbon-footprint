/*
 * © 2021 Thoughtworks, Inc.
 */

import IUsageData from '../IUsageData'

export default interface UnknownUsage extends IUsageData {
  readonly cost: number
  readonly usageUnit: string
  readonly usageType?: string
  readonly reclassificationType: string
}
