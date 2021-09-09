/*
 * © 2021 Thoughtworks, Inc.
 */

import { median, reduceBy } from 'ramda'

import { COMPUTE_PROCESSOR_TYPES } from './compute'
import { BillingDataRow, CloudConstantsEmissionsFactors } from '.'

export default interface FootprintEstimate {
  timestamp: Date
  kilowattHours: number
  co2e: number
  usesAverageCPUConstant?: boolean
}

export type CostAndCo2eTotals = {
  cost: number
  co2e: number
}

export type Co2ePerCost = { [key: string]: CostAndCo2eTotals }

export enum EstimateClassification {
  COMPUTE = 'compute',
  STORAGE = 'storage',
  NETWORKING = 'networking',
  MEMORY = 'memory',
  UNKNOWN = 'unknown',
}

export const aggregateEstimatesByDay = (
  estimates: FootprintEstimate[],
): { [date: string]: FootprintEstimate } => {
  const getDayOfEstimate = (estimate: { timestamp: Date }) =>
    estimate.timestamp.toISOString().substr(0, 10)

  const accumulatingFn = (acc: FootprintEstimate, value: FootprintEstimate) => {
    acc.timestamp = acc.timestamp || new Date(getDayOfEstimate(value))
    acc.kilowattHours += value.kilowattHours
    acc.co2e += value.co2e
    if (value.usesAverageCPUConstant) {
      acc.usesAverageCPUConstant =
        acc.usesAverageCPUConstant || value.usesAverageCPUConstant
    }
    return acc
  }

  return reduceBy(
    accumulatingFn,
    {
      kilowattHours: 0,
      co2e: 0,
      timestamp: undefined,
      usesAverageCPUConstant: false,
    },
    getDayOfEstimate,
    estimates,
  )
}

export interface MutableEstimationResult {
  timestamp: Date
  serviceEstimates: MutableServiceEstimate[]
}

export interface MutableServiceEstimate {
  cloudProvider: string
  accountId: string
  accountName: string
  serviceName: string
  kilowattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant: boolean
}

export const accumulateCo2PerCost = (
  classification: EstimateClassification,
  co2e: number,
  cost: number,
  costPerCo2e: Co2ePerCost,
): void => {
  costPerCo2e[classification].cost += cost
  costPerCo2e.total.cost += cost
  if (co2e > 0) {
    costPerCo2e[classification].co2e += co2e
    costPerCo2e.total.co2e += co2e
  }
}

export const appendOrAccumulateEstimatesByDay = (
  results: MutableEstimationResult[],
  rowData: BillingDataRow,
  footprintEstimate: FootprintEstimate,
): void => {
  const serviceEstimate: MutableServiceEstimate = {
    cloudProvider: rowData.cloudProvider,
    kilowattHours: footprintEstimate.kilowattHours,
    co2e: footprintEstimate.co2e,
    usesAverageCPUConstant: footprintEstimate.usesAverageCPUConstant,
    serviceName: rowData.serviceName,
    accountId: rowData.accountId,
    accountName: rowData.accountName,
    region: rowData.region,
    cost: rowData.cost,
  }

  if (dayExistsInEstimates(results, rowData.timestamp)) {
    const estimatesForDay = results.find(
      (estimate) =>
        estimate.timestamp.getTime() === rowData.timestamp.getTime(),
    )

    if (
      estimateExistsForRegionAndServiceAndAccount(
        results,
        rowData.timestamp,
        serviceEstimate,
      )
    ) {
      const estimateToAcc = estimatesForDay.serviceEstimates.find(
        (estimateForDay) => {
          return hasSameRegionAndServiceAndAccount(
            estimateForDay,
            serviceEstimate,
          )
        },
      )
      estimateToAcc.kilowattHours += serviceEstimate.kilowattHours
      estimateToAcc.co2e += serviceEstimate.co2e
      estimateToAcc.cost += serviceEstimate.cost
      if (serviceEstimate.usesAverageCPUConstant) {
        estimateToAcc.usesAverageCPUConstant =
          estimateToAcc.usesAverageCPUConstant ||
          serviceEstimate.usesAverageCPUConstant
      }
    } else {
      estimatesForDay.serviceEstimates.push(serviceEstimate)
    }
  } else {
    results.push({
      timestamp: rowData.timestamp,
      serviceEstimates: [serviceEstimate],
    })
  }
}

function dayExistsInEstimates(
  results: MutableEstimationResult[],
  timestamp: Date,
): boolean {
  return results.some(
    (estimate) => estimate.timestamp.getTime() === timestamp.getTime(),
  )
}

function estimateExistsForRegionAndServiceAndAccount(
  results: MutableEstimationResult[],
  timestamp: Date,
  serviceEstimate: MutableServiceEstimate,
): boolean {
  const estimatesForDay = results.find(
    (estimate) => estimate.timestamp.getTime() === timestamp.getTime(),
  )
  return estimatesForDay.serviceEstimates.some((estimateForDay) => {
    return hasSameRegionAndServiceAndAccount(estimateForDay, serviceEstimate)
  })
}

function hasSameRegionAndServiceAndAccount(
  estimateOne: MutableServiceEstimate,
  estimateTwo: MutableServiceEstimate,
): boolean {
  return (
    estimateOne.region === estimateTwo.region &&
    estimateOne.serviceName === estimateTwo.serviceName &&
    estimateOne.accountId === estimateTwo.accountId
  )
}

// When we have a group of compute processor types, by we default calculate the average for this group of processors.
// However when the group contains either the Sandy Bridge or Ivy Bridge processor type, we calculate the median.
// This is because those processor types are outliers with much higher min/max watts that the other types, so we
// want to take this into account to not over estimate the compute energy in kilowatts.
export function getWattsByAverageOrMedian(
  computeProcessors: string[],
  wattsForProcessors: number[],
): number {
  if (
    computeProcessors.includes(COMPUTE_PROCESSOR_TYPES.SANDY_BRIDGE) ||
    computeProcessors.includes(COMPUTE_PROCESSOR_TYPES.IVY_BRIDGE)
  ) {
    return median(wattsForProcessors)
  }
  return getAverage(wattsForProcessors)
}

export function getAverage(nums: number[]): number {
  if (!nums.length) return 0
  if (nums.length === 1) return nums[0]
  return nums.reduce((a, b) => a + b) / nums.length
}

export function estimateCo2(
  estimatedWattHours: number,
  region: string,
  emissionsFactors?: CloudConstantsEmissionsFactors,
): number {
  return (
    estimatedWattHours *
    (emissionsFactors[region] || emissionsFactors['Unknown'])
  )
}

export function estimateKwh(
  estimatedCo2e: number,
  region: string,
  emissionsFactors?: CloudConstantsEmissionsFactors,
): number {
  return (
    estimatedCo2e / (emissionsFactors[region] || emissionsFactors['Unknown'])
  )
}
