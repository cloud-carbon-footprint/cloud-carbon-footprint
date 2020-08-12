import { EstimationResult } from '@application/EstimationResult'
import { displayCo2e, displayWattHours, Totals } from '@view/EmissionsTableUtils'

export default function EmissionsByDayTable(
  estimations: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date', 'Watt Hours', 'Kg CO2e Emissions']
  const colWidths: number[] = [15, 20, 25]
  const table: string[][] = [headers]

  const grandTotals: Totals = {}

  let wattHoursTotal = 0
  let co2eTotal = 0
  estimations.forEach((estimationResult) => {
    estimationResult.estimates.forEach((estimate) => {
      const dateKey = estimationResult.timestamp.toISOString().substr(0, 10)
      if (!grandTotals.hasOwnProperty(dateKey)) {
        grandTotals[dateKey] = { wattHours: 0, co2e: 0 }
      }
      grandTotals[dateKey].wattHours += estimate.wattHours
      wattHoursTotal += estimate.wattHours
      grandTotals[dateKey].co2e += estimate.co2e
      co2eTotal += estimate.co2e
    })
  })

  grandTotals['Total'] = { wattHours: wattHoursTotal, co2e: co2eTotal }

  Object.entries(grandTotals).forEach(([rowName, rowData]) => {
    table.push([rowName, displayWattHours(rowData.wattHours), displayCo2e(rowData.co2e)])
  })

  return { table, colWidths }
}
