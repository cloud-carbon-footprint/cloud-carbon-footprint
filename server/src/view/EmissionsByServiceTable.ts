/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import {
  displayCo2e,
  displayCost,
  displayServiceName,
  displayWattHours,
  initialTotals,
  Totals,
} from '@view/EmissionsTableUtils'
import { EstimationResult } from '@application/EstimationResult'
import { pluck, uniq } from 'ramda'

export default function EmissionsByServiceTable(
  estimationResults: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Service', 'Watt Hours', 'mt CO2e Emissions', 'Cost']
  const colWidths: number[] = [15, 20, 25, 20]
  const table: string[][] = [headers]
  const serviceNames = uniq(
    estimationResults
      .map((estimation) => {
        return pluck('serviceName', estimation.serviceEstimates)
      })
      .flat(),
  )
  const grandTotals: Totals = initialTotals(serviceNames)

  estimationResults.forEach((estimationResult) => {
    estimationResult.serviceEstimates.forEach((serviceEstimate) => {
      if (grandTotals[serviceEstimate.serviceName]) {
        grandTotals[serviceEstimate.serviceName].wattHours += serviceEstimate.wattHours
        grandTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
        grandTotals[serviceEstimate.serviceName].cost += serviceEstimate.cost
      } else {
        grandTotals[serviceEstimate.serviceName] = {
          wattHours: serviceEstimate.wattHours,
          co2e: serviceEstimate.co2e,
          cost: serviceEstimate.cost,
        }
      }

      grandTotals['total'].wattHours += serviceEstimate.wattHours
      grandTotals['total'].co2e += serviceEstimate.co2e
      grandTotals['total'].cost += serviceEstimate.cost
    })
  })

  Object.entries(grandTotals).forEach(([serviceName, serviceData]) => {
    table.push([
      displayServiceName(serviceName),
      displayWattHours(serviceData.wattHours),
      displayCo2e(serviceData.co2e),
      displayCost(serviceData.cost),
    ])
  })

  return { table, colWidths }
}
