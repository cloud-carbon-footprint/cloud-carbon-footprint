/*
 * © 2021 Thoughtworks, Inc.
 */

import { EstimationResult } from '@cloud-carbon-footprint/common'

import { displayCo2e, displayWattHours, Totals } from './EmissionsTableUtils'

export default function EmissionsByDayTable(
  estimationResults: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date', 'kilowatt hours', 'metric tons CO2e Emissions']
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
        grandTotals[dateKey] = { kilowattHours: 0, co2e: 0, cost: 0 }
      }
      grandTotals[dateKey].kilowattHours += serviceEstimate.kilowattHours
      wattHoursTotal += serviceEstimate.kilowattHours
      grandTotals[dateKey].co2e += serviceEstimate.co2e
      co2eTotal += serviceEstimate.co2e
      grandTotals[dateKey].cost += serviceEstimate.cost
      costTotal += serviceEstimate.cost
    })
  })

  grandTotals['Total'] = {
    kilowattHours: wattHoursTotal,
    co2e: co2eTotal,
    cost: costTotal,
  }

  Object.entries(grandTotals).forEach(([rowName, rowData]) => {
    table.push([
      rowName,
      displayWattHours(rowData.kilowattHours),
      displayCo2e(rowData.co2e),
    ])
  })

  return { table, colWidths }
}
