/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { displayCo2e, displayServiceName, displayWattHours, initialTotals, Totals } from '@view/EmissionsTableUtils'
import config from '@application/Config'
import { pluck } from 'ramda'
import moment from 'moment'
import { EstimationResult } from '@application/EstimationResult'

const displayDate = (timestamp: Date) => moment(timestamp).utc().format('YYYY-MM-DD')
const displayService = (totals: Totals, serviceName: string) => [
  displayWattHours(totals[serviceName].wattHours),
  displayCo2e(totals[serviceName].co2e),
]

export default function EmissionsByDayAndServiceTable(
  estimationResults: EstimationResult[],
  serviceNames = pluck('key', [...config.AWS.CURRENT_SERVICES, ...config.GCP.CURRENT_SERVICES]),
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date (UTC)']
  const colWidths: number[] = [15]

  serviceNames.forEach((serviceName) => {
    headers.push(
      `${displayServiceName(serviceName)} Watt Hours`,
      `${displayServiceName(serviceName)} mt CO2e Emissions`,
    )
    colWidths.push(20, 25)
  })

  headers.push(`SUM Watt Hours`, `SUM mt CO2e Emissions`)
  colWidths.push(20, 25)

  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals()

  estimationResults.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))

  estimationResults.forEach((estimationResult) => {
    const subTotals: Totals = initialTotals()

    estimationResult.serviceEstimates.forEach((serviceEstimate) => {
      grandTotals[serviceEstimate.serviceName].wattHours += serviceEstimate.wattHours
      grandTotals['total'].wattHours += serviceEstimate.wattHours
      subTotals[serviceEstimate.serviceName].wattHours += serviceEstimate.wattHours
      subTotals['total'].wattHours += serviceEstimate.wattHours

      grandTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
      grandTotals['total'].co2e += serviceEstimate.co2e
      subTotals[serviceEstimate.serviceName].co2e += serviceEstimate.co2e
      subTotals['total'].co2e += serviceEstimate.co2e
    })

    table.push([
      displayDate(estimationResult.timestamp),
      ...serviceNames.map((serviceName) => displayService(subTotals, serviceName)).flat(),
      ...displayService(subTotals, 'total'),
    ])
  })

  table.push([
    'Total',
    ...serviceNames.map((serviceName) => displayService(grandTotals, serviceName)).flat(),
    ...displayService(grandTotals, 'total'),
  ])

  return { table, colWidths }
}
