/*
 * © 2021 Thoughtworks, Inc.
 */

import { pluck, uniq } from 'ramda'
import moment from 'moment'

import { EstimationResult } from '@cloud-carbon-footprint/common'

import {
  displayCo2e,
  displayServiceName,
  displayWattHours,
  initialTotals,
  Totals,
} from './EmissionsTableUtils'

const displayDate = (timestamp: Date) =>
  moment(timestamp).utc().format('YYYY-MM-DD')
const displayService = (totals: Totals, serviceName: string) => [
  displayWattHours(totals[serviceName].kilowattHours),
  displayCo2e(totals[serviceName].co2e),
]

export default function EmissionsByDayAndServiceTable(
  estimationResults: EstimationResult[],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date (UTC)']
  const colWidths: number[] = [15]

  const serviceNames = uniq(
    estimationResults
      .map((estimation) => {
        return pluck('serviceName', estimation.serviceEstimates)
      })
      .flat(),
  )

  serviceNames.forEach((serviceName) => {
    headers.push(
      `${displayServiceName(serviceName)} kilowatt hours`,
      `${displayServiceName(serviceName)} metric tons CO2e Emissions`,
    )
    colWidths.push(20, 25)
  })

  headers.push(`SUM kilowatt hours`, `SUM metric tons CO2e Emissions`)
  colWidths.push(20, 25)

  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals(serviceNames)

  estimationResults.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))

  estimationResults.forEach((estimationResult) => {
    const subTotals: Totals = initialTotals(serviceNames)

    estimationResult.serviceEstimates.forEach((serviceEstimate) => {
      grandTotals[serviceEstimate.serviceName].kilowattHours +=
        serviceEstimate.kilowattHours
      grandTotals['total'].kilowattHours += serviceEstimate.kilowattHours
      subTotals[serviceEstimate.serviceName].kilowattHours +=
        serviceEstimate.kilowattHours
      subTotals['total'].kilowattHours += serviceEstimate.kilowattHours

      grandTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
      grandTotals['total'].co2e += serviceEstimate.co2e
      subTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
      subTotals['total'].co2e += serviceEstimate.co2e
    })
    const subTotalsServiceNames = Object.keys(subTotals).filter(
      (total) => total !== 'total',
    )
    table.push([
      displayDate(estimationResult.timestamp),
      ...subTotalsServiceNames
        .map((serviceName) => displayService(subTotals, serviceName))
        .flat(),
      ...displayService(subTotals, 'total'),
    ])
  })

  table.push([
    'Total',
    ...serviceNames
      .map((serviceName) => displayService(grandTotals, serviceName))
      .flat(),
    ...displayService(grandTotals, 'total'),
  ])

  return { table, colWidths }
}
