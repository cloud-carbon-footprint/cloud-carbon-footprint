/*
 * © 2021 Thoughtworks, Inc.
 */

import { reduceBy } from 'ramda'

export interface EstimationResult {
  readonly timestamp: Date
  readonly serviceEstimates: ServiceData[]
}

export interface ServiceData {
  readonly cloudProvider: string
  readonly kilowattHours: number
  readonly co2e: number
  readonly cost: number
  readonly usesAverageCPUConstant?: boolean
  readonly accountId: string
  // these attributes are mutable because it is required by the client package
  accountName: string
  serviceName: string
  region: string
}

export const reduceByTimestamp = (
  estimationResults: EstimationResult[],
): EstimationResult[] => {
  // We need this mutable type in order to set the first timestamp based on the estimationResults values.
  interface MutableEstimationResult {
    timestamp: Date | undefined
    serviceEstimates: ServiceData[]
  }

  const accumulatingFn = (
    acc: MutableEstimationResult,
    value: MutableEstimationResult,
  ) => {
    acc.timestamp = acc.timestamp || new Date(value.timestamp)
    acc.serviceEstimates = acc.serviceEstimates.concat(value.serviceEstimates)
    return acc
  }
  const getTimeOfEstimate = (estimationResult: { timestamp: Date }) =>
    estimationResult.timestamp.toISOString()

  const result = reduceBy(
    accumulatingFn,
    { timestamp: undefined, serviceEstimates: [] },
    getTimeOfEstimate,
    estimationResults,
  )

  return Object.values(result)
}
