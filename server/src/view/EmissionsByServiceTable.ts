import { EstimationResult } from '@application/EstimationResult'
import { displayCo2e, displayServiceName, displayWattHours, initialTotals, Totals } from '@view/EmissionsTableUtils'

export default function EmissionsByServiceTable(
  estimationResults: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Service', 'Watt Hours', 'Kg CO2e Emissions']
  const colWidths: number[] = [15, 20, 25]
  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals()

  estimationResults.forEach((estimationResult) => {
    estimationResult.estimates.forEach((serviceEstimate) => {
      grandTotals[serviceEstimate.serviceName].wattHours += serviceEstimate.wattHours
      grandTotals['total'].wattHours += serviceEstimate.wattHours
      grandTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
      grandTotals['total'].co2e += serviceEstimate.co2e
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
