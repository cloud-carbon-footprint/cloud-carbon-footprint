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

export default function EmissionsByServiceTable(
  estimationResults: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Service', 'Watt Hours', 'Kg CO2e Emissions', 'Cost']
  const colWidths: number[] = [15, 20, 25, 20]
  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals()

  estimationResults.forEach((estimationResult) => {
    estimationResult.serviceEstimates.forEach((serviceEstimate) => {
      grandTotals[serviceEstimate.serviceName].wattHours += serviceEstimate.wattHours
      grandTotals['total'].wattHours += serviceEstimate.wattHours
      grandTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
      grandTotals['total'].co2e += serviceEstimate.co2e
      grandTotals[serviceEstimate.serviceName].cost += serviceEstimate.cost
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
