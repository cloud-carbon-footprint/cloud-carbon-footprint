/*
 * © 2021 Thoughtworks, Inc.
 */

import { IUsageData } from '../.'

export default interface EmbodiedEmissionsUsage extends IUsageData {
  instancevCpu: number
  largestInstancevCpu: number
  usageTimePeriod: number
  scopeThreeEmissions: number
}
