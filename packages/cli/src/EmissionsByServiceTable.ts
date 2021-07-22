/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  displayCo2e,
  displayCost,
  displayServiceName,
  displayWattHours,
  initialTotals,
  Totals,
} from './EmissionsTableUtils'
import { EstimationResult } from '@cloud-carbon-footprint/common'
import { pluck, uniq } from 'ramda'

export default function EmissionsByServiceTable(
  estimationResults: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = [
    'Service',
    'kilowatt hours',
    'metric tons CO2e Emissions',
    'Cost',
  ]
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
        grandTotals[serviceEstimate.serviceName].kilowattHours +=
          serviceEstimate.kilowattHours
        grandTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
        grandTotals[serviceEstimate.serviceName].cost += serviceEstimate.cost
      } else {
        grandTotals[serviceEstimate.serviceName] = {
          kilowattHours: serviceEstimate.kilowattHours,
          co2e: serviceEstimate.co2e,
          cost: serviceEstimate.cost,
        }
      }

      grandTotals['total'].kilowattHours += serviceEstimate.kilowattHours
      grandTotals['total'].co2e += serviceEstimate.co2e
      grandTotals['total'].cost += serviceEstimate.cost
    })
  })

  Object.entries(grandTotals).forEach(([serviceName, serviceData]) => {
    table.push([
      displayServiceName(serviceName),
      displayWattHours(serviceData.kilowattHours),
      displayCo2e(serviceData.co2e),
      displayCost(serviceData.cost),
    ])
  })

  return { table, colWidths }
}
