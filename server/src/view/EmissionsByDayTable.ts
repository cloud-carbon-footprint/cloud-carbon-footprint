import { displayCo2e, displayWattHours, Totals } from '@view/EmissionsTableUtils'
import { RegionResult } from '@application/EstimationResult'

export default function EmissionsByDayTable(regionResults: RegionResult[]): { table: string[][]; colWidths: number[] } {
  const headers = ['Date', 'Watt Hours', 'Kg CO2e Emissions']
  const colWidths: number[] = [15, 20, 25]
  const table: string[][] = [headers]

  const grandTotals: Totals = {}

  let wattHoursTotal = 0
  let co2eTotal = 0
  let costTotal = 0

  regionResults.forEach((regionResult) => {
    regionResult.serviceResults.forEach((serviceResult) => {
      serviceResult.estimationResults.forEach((estimationResult) => {
        const dateKey: string = estimationResult.timestamp.toISOString().substr(0, 10)

        estimationResult.serviceData.forEach((usage) => {
          if (!grandTotals.hasOwnProperty(dateKey)) {
            grandTotals[dateKey] = { wattHours: 0, co2e: 0, cost: 0 }
          }
          grandTotals[dateKey].wattHours += usage.wattHours
          wattHoursTotal += usage.wattHours
          grandTotals[dateKey].co2e += usage.co2e
          co2eTotal += usage.co2e
          grandTotals[dateKey].cost += usage.cost
          costTotal += usage.cost
        })
      })
    })
  })

  grandTotals['Total'] = { wattHours: wattHoursTotal, co2e: co2eTotal, cost: costTotal }

  Object.entries(grandTotals).forEach(([rowName, rowData]) => {
    table.push([rowName, displayWattHours(rowData.wattHours), displayCo2e(rowData.co2e)])
  })

  return { table, colWidths }
}
