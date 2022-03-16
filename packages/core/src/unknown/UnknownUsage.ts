/*
 * © 2021 Thoughtworks, Inc.
 */

import IUsageData from '../IUsageData'

export default interface UnknownUsage extends IUsageData {
  readonly cost?: number
  readonly usageAmount?: number
  readonly usageUnit: string
  readonly usageType?: string
  readonly service?: string
  readonly reclassificationType?: string
  readonly replicationFactor?: number
}
