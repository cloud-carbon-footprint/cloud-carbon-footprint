import {
  displayCo2e,
  displayCost,
  displayServiceName,
  displayWattHours,
  initialTotals,
  Totals,
} from '@view/EmissionsTableUtils'
import { RegionResult } from '@application/EstimationResult'

export default function EmissionsByServiceTable(
  regionResults: RegionResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Service', 'Watt Hours', 'Kg CO2e Emissions', 'Cost']
  const colWidths: number[] = [15, 20, 25, 20]
  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals()

  regionResults.forEach((regionResult) => {
    regionResult.serviceResults.forEach((serviceResult) => {
      const serviceName: string = serviceResult.serviceName

      serviceResult.estimationResults.forEach((estimationResult) => {
        estimationResult.serviceData.forEach((usage) => {
          grandTotals[serviceName].wattHours += usage.wattHours
          grandTotals['total'].wattHours += usage.wattHours
          grandTotals[serviceName].co2e += usage.co2e
          grandTotals['total'].co2e += usage.co2e
          grandTotals[serviceName].cost += usage.cost
          grandTotals['total'].cost += usage.cost
        })
      })
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
