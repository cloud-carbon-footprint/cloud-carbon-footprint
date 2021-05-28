/*
 * © 2021 ThoughtWorks, Inc.
 */

import { reduceBy } from 'ramda'
import { BillingDataRow } from '.'

export default interface FootprintEstimate {
  timestamp: Date
  kilowattHours: number
  co2e: number
  usesAverageCPUConstant?: boolean
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
  accountName: string
  serviceName: string
  kilowattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant: boolean
}

export const appendOrAccumulateEstimatesByDay = (
  results: MutableEstimationResult[],
  costAndUsageReportRow: BillingDataRow,
  footprintEstimate: FootprintEstimate,
): void => {
  const serviceEstimate: MutableServiceEstimate = {
    cloudProvider: costAndUsageReportRow.cloudProvider,
    kilowattHours: footprintEstimate.kilowattHours,
    co2e: footprintEstimate.co2e,
    usesAverageCPUConstant: footprintEstimate.usesAverageCPUConstant,
    serviceName: costAndUsageReportRow.serviceName,
    accountName: costAndUsageReportRow.accountName,
    region: costAndUsageReportRow.region,
    cost: costAndUsageReportRow.cost,
  }

  if (dayExistsInEstimates(results, costAndUsageReportRow.timestamp)) {
    const estimatesForDay = results.find(
      (estimate) =>
        estimate.timestamp.getTime() ===
        costAndUsageReportRow.timestamp.getTime(),
    )

    if (
      estimateExistsForRegionAndService(
        results,
        costAndUsageReportRow.timestamp,
        serviceEstimate,
      )
    ) {
      const estimateToAcc = estimatesForDay.serviceEstimates.find(
        (estimateForDay) => {
          return hasSameRegionAndService(estimateForDay, serviceEstimate)
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
      timestamp: costAndUsageReportRow.timestamp,
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

function estimateExistsForRegionAndService(
  results: MutableEstimationResult[],
  timestamp: Date,
  serviceEstimate: MutableServiceEstimate,
): boolean {
  const estimatesForDay = results.find(
    (estimate) => estimate.timestamp.getTime() === timestamp.getTime(),
  )
  return estimatesForDay.serviceEstimates.some((estimateForDay) => {
    return hasSameRegionAndService(estimateForDay, serviceEstimate)
  })
}

function hasSameRegionAndService(
  estimateOne: MutableServiceEstimate,
  estimateTwo: MutableServiceEstimate,
): boolean {
  return (
    estimateOne.region === estimateTwo.region &&
    estimateOne.serviceName === estimateTwo.serviceName
  )
}
