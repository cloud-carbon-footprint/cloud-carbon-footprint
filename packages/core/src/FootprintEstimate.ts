/*
 * © 2021 Thoughtworks, Inc.
 */

import { median, reduceBy } from 'ramda'

import { COMPUTE_PROCESSOR_TYPES } from './compute'
import { BillingDataRow, CloudConstantsEmissionsFactors } from '.'
import { GroupBy, getPeriodEndDate } from '@cloud-carbon-footprint/common'

export default interface FootprintEstimate {
  timestamp: Date
  kilowattHours: number
  co2e: number
  usesAverageCPUConstant?: boolean
}

export type CostAndKilowattHourTotals = {
  cost: number
  kilowattHours: number
}

// TODO: Remove once all cloud providers are updated to use the types below instead
export type KilowattHoursPerCostLegacy = {
  [key: string]: CostAndKilowattHourTotals
}

export type KilowattHoursPerCost = {
  [key: string]: {
    [key: string]: CostAndKilowattHourTotals
  }
}

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
  periodStartDate: Date
  periodEndDate: Date
  groupBy: GroupBy
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

// TODO - Remove once all cloud providers are using the new function below.
export const accumulateKilowattHoursPerCostLegacy = (
  classification: EstimateClassification,
  kilowattHours: number,
  cost: number,
  costPerCo2e: KilowattHoursPerCostLegacy,
): void => {
  costPerCo2e[classification].cost += cost
  costPerCo2e.total.cost += cost
  if (kilowattHours > 0) {
    costPerCo2e[classification].kilowattHours += kilowattHours
    costPerCo2e.total.kilowattHours += kilowattHours
  }
}

export const accumulateKilowattHoursPerCost = (
  costPerCo2e: KilowattHoursPerCost,
  billingDataRow: BillingDataRow,
  kilowattHours: number,
): void => {
  setOrAccumulateByServiceAndUsageUnit(
    costPerCo2e,
    billingDataRow,
    kilowattHours,
  )
  setOrAccumulateUsageUnitTotals(costPerCo2e, billingDataRow, kilowattHours)
}

const setOrAccumulateByServiceAndUsageUnit = (
  costPerCo2e: KilowattHoursPerCost,
  billingDataRow: BillingDataRow,
  kilowattHours: number,
): void => {
  const { serviceName, usageUnit, cost } = billingDataRow
  // Service doesn't exist: set service and usage unit
  if (!costPerCo2e[serviceName]) {
    costPerCo2e[serviceName] = {
      [usageUnit]: {
        cost: cost,
        kilowattHours: kilowattHours,
      },
    }
    return
  }

  // Service exists, but no usage unit for the service: set usage unit for service
  if (costPerCo2e[serviceName] && !costPerCo2e[serviceName][usageUnit]) {
    costPerCo2e[serviceName][usageUnit] = {
      cost: cost,
      kilowattHours: kilowattHours,
    }
    return
  }

  // Usage unit exists for service - accumulate
  if (costPerCo2e[serviceName][usageUnit]) {
    costPerCo2e[serviceName][usageUnit].cost += cost
    costPerCo2e[serviceName][usageUnit].kilowattHours += kilowattHours
  }
}

const setOrAccumulateUsageUnitTotals = (
  costPerCo2e: KilowattHoursPerCost,
  billingDataRow: BillingDataRow,
  kilowattHours: number,
): void => {
  const { usageUnit, cost } = billingDataRow
  if (costPerCo2e.total[usageUnit]) {
    costPerCo2e.total[usageUnit].cost += cost
    costPerCo2e.total[usageUnit].kilowattHours += kilowattHours
  } else {
    costPerCo2e.total[usageUnit] = {
      cost: cost,
      kilowattHours: kilowattHours,
    }
  }
}

export const appendOrAccumulateEstimatesByDay = (
  results: MutableEstimationResult[],
  rowData: BillingDataRow,
  footprintEstimate: FootprintEstimate,
  grouping: GroupBy,
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
      periodStartDate: rowData.timestamp,
      periodEndDate: getPeriodEndDate(rowData.timestamp, grouping),
      groupBy: grouping,
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
  estimatedKilowattHours: number,
  region: string,
  emissionsFactors?: CloudConstantsEmissionsFactors,
): number {
  return (
    estimatedKilowattHours *
    (emissionsFactors[region] || emissionsFactors['Unknown'])
  )
}

export function estimateKwh(
  estimatedCo2e: number,
  region: string,
  emissionsFactors?: CloudConstantsEmissionsFactors,
  replicationFactor = 1,
): number {
  return (
    (estimatedCo2e /
      (emissionsFactors[region] || emissionsFactors['Unknown'])) *
    replicationFactor
  )
}
