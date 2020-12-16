/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import CostAndUsageReportsRow from '@services/aws/CostAndUsageReportsRow'
import FootprintEstimate from '@domain/FootprintEstimate'

export interface MutableEstimationResult {
  timestamp: Date
  serviceEstimates: MutableServiceEstimate[]
}

export interface MutableServiceEstimate {
  cloudProvider: string
  accountName: string
  serviceName: string
  wattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant: boolean
}

export default function buildEstimateFromCostAndUsageRow(
  results: MutableEstimationResult[],
  costAndUsageReportRow: CostAndUsageReportsRow,
  footprintEstimate: FootprintEstimate,
) {
  const serviceEstimate: MutableServiceEstimate = {
    cloudProvider: 'AWS',
    wattHours: footprintEstimate.wattHours,
    co2e: footprintEstimate.co2e,
    usesAverageCPUConstant: footprintEstimate.usesAverageCPUConstant,
    serviceName: costAndUsageReportRow.serviceName,
    accountName: costAndUsageReportRow.accountId,
    region: costAndUsageReportRow.region,
    cost: costAndUsageReportRow.cost,
  }

  if (dayExistsInEstimates(results, costAndUsageReportRow.timestamp)) {
    const estimatesForDay = results.find(
      (estimate) => estimate.timestamp.getTime() === costAndUsageReportRow.timestamp.getTime(),
    )

    if (estimateExistsForRegionAndService(results, costAndUsageReportRow.timestamp, serviceEstimate)) {
      const estimateToAcc = estimatesForDay.serviceEstimates.find((estimateForDay) => {
        return hasSameRegionAndService(estimateForDay, serviceEstimate)
      })
      estimateToAcc.wattHours += serviceEstimate.wattHours
      estimateToAcc.co2e += serviceEstimate.co2e
      estimateToAcc.cost += serviceEstimate.cost
      if (serviceEstimate.usesAverageCPUConstant) {
        estimateToAcc.usesAverageCPUConstant =
          estimateToAcc.usesAverageCPUConstant || serviceEstimate.usesAverageCPUConstant
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

function dayExistsInEstimates(results: MutableEstimationResult[], timestamp: Date): boolean {
  return results.some((estimate) => estimate.timestamp.getTime() === timestamp.getTime())
}

function estimateExistsForRegionAndService(
  results: MutableEstimationResult[],
  timestamp: Date,
  serviceEstimate: MutableServiceEstimate,
): boolean {
  const estimatesForDay = results.find((estimate) => estimate.timestamp.getTime() === timestamp.getTime())
  return estimatesForDay.serviceEstimates.some((estimateForDay) => {
    return hasSameRegionAndService(estimateForDay, serviceEstimate)
  })
}

function hasSameRegionAndService(estimateOne: MutableServiceEstimate, estimateTwo: MutableServiceEstimate): boolean {
  return estimateOne.region === estimateTwo.region && estimateOne.serviceName === estimateTwo.serviceName
}
