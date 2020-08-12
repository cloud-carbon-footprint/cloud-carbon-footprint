import { EstimationResult } from '@application/EstimationResult'
import moment from 'moment'
import { displayCo2e, displayServiceName, displayWattHours, initialTotals, Totals } from '@view/EmissionsTableUtils'

const displayDate = (timestamp: Date) => moment(timestamp).utc().format('YYYY-MM-DD')
const displayService = (totals: Totals, serviceName: string) => [
  displayWattHours(totals[serviceName].wattHours),
  displayCo2e(totals[serviceName].co2e),
]

export default function EmissionsByDayAndServiceTable(
  estimations: EstimationResult[],
  serviceNames = ['ebs', 's3', 'ec2', 'elasticache', 'rds'],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date (UTC)']
  const colWidths: number[] = [15]

  serviceNames.forEach((serviceName) => {
    headers.push(
      `${displayServiceName(serviceName)} Watt Hours`,
      `${displayServiceName(serviceName)} Kg CO2e Emissions`,
    )
    colWidths.push(20, 25)
  })

  headers.push(`SUM Watt Hours`, `SUM Kg CO2e Emissions`)
  colWidths.push(20, 25)

  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals()

  estimations.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))

  estimations.forEach((estimationResult) => {
    const subTotals: Totals = initialTotals()

    estimationResult.estimates.forEach((estimate) => {
      grandTotals[estimate.serviceName].wattHours += estimate.wattHours
      grandTotals['total'].wattHours += estimate.wattHours
      subTotals[estimate.serviceName].wattHours = estimate.wattHours
      subTotals['total'].wattHours += estimate.wattHours

      grandTotals[estimate.serviceName].co2e += estimate.co2e
      grandTotals['total'].co2e += estimate.co2e
      subTotals[estimate.serviceName].co2e = estimate.co2e
      subTotals['total'].co2e += estimate.co2e
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
