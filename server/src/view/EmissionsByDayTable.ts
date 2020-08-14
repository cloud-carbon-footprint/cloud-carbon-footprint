import { displayCo2e, displayWattHours, Totals } from '@view/EmissionsTableUtils'
import { ServiceDailyMetricResult } from '@application/App'

export default function EmissionsByDayTable(
  estimationResults: ServiceDailyMetricResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date', 'Watt Hours', 'Kg CO2e Emissions']
  const colWidths: number[] = [15, 20, 25]
  const table: string[][] = [headers]

  const grandTotals: Totals = {}

  let wattHoursTotal = 0
  let co2eTotal = 0
  estimationResults.forEach((estimationResult) => {
    estimationResult.estimates.forEach((serviceEstimate) => {
      const dateKey = estimationResult.timestamp.toISOString().substr(0, 10)
      if (!grandTotals.hasOwnProperty(dateKey)) {
        grandTotals[dateKey] = { wattHours: 0, co2e: 0 }
      }
      grandTotals[dateKey].wattHours += serviceEstimate.wattHours
      wattHoursTotal += serviceEstimate.wattHours
      grandTotals[dateKey].co2e += serviceEstimate.co2e
      co2eTotal += serviceEstimate.co2e
    })
  })

  grandTotals['Total'] = { wattHours: wattHoursTotal, co2e: co2eTotal }

  Object.entries(grandTotals).forEach(([rowName, rowData]) => {
    table.push([rowName, displayWattHours(rowData.wattHours), displayCo2e(rowData.co2e)])
  })

  return { table, colWidths }
}
