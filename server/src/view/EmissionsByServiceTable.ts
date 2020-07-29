import { EstimationResult } from '@application/EstimationResult'
import { displayCo2e, displayServiceName, displayWattHours, initialTotals, Totals } from '@view/EmissionsTableUtils'

export default function EmissionsByServiceTable(
  estimations: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Service', 'Watt Hours', 'Kg CO2e Emissions']
  const colWidths: number[] = [15, 20, 25]
  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals()

  estimations.forEach((estimationResult) => {
    estimationResult.estimates.forEach((estimate) => {
      grandTotals[estimate.serviceName].wattHours += estimate.wattHours
      grandTotals['total'].wattHours += estimate.wattHours
      grandTotals[estimate.serviceName].co2e += estimate.co2e
      grandTotals['total'].co2e += estimate.co2e
    })
  })

  Object.entries(grandTotals).forEach(([serviceName, serviceData]) => {
    table.push([
      displayServiceName(serviceName),
      displayWattHours(serviceData.wattHours),
      displayCo2e(serviceData.co2e),
    ])
  })

  return { table, colWidths }
}
