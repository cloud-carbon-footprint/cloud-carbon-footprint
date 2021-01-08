/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { displayCo2e, displayWattHours, Totals } from '@view/EmissionsTableUtils'
import { EstimationResult } from '@application/EstimationResult'

export default function EmissionsByDayTable(
  estimationResults: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date', 'Watt Hours', 'mt CO2e Emissions']
  const colWidths: number[] = [15, 20, 25]
  const table: string[][] = [headers]

  const grandTotals: Totals = {}

  let wattHoursTotal = 0
  let co2eTotal = 0
  let costTotal = 0

  estimationResults.forEach((estimationResult) => {
    estimationResult.serviceEstimates.forEach((serviceEstimate) => {
      const dateKey = estimationResult.timestamp.toISOString().substr(0, 10)
      if (!grandTotals.hasOwnProperty(dateKey)) {
        grandTotals[dateKey] = { wattHours: 0, co2e: 0, cost: 0 }
      }
      grandTotals[dateKey].wattHours += serviceEstimate.wattHours
      wattHoursTotal += serviceEstimate.wattHours
      grandTotals[dateKey].co2e += serviceEstimate.co2e
      co2eTotal += serviceEstimate.co2e
      grandTotals[dateKey].cost += serviceEstimate.cost
      costTotal += serviceEstimate.cost
    })
  })

  grandTotals['Total'] = { wattHours: wattHoursTotal, co2e: co2eTotal, cost: costTotal }

  Object.entries(grandTotals).forEach(([rowName, rowData]) => {
    table.push([rowName, displayWattHours(rowData.wattHours), displayCo2e(rowData.co2e)])
  })

  return { table, colWidths }
}
