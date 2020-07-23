import { EstimationResult } from '@application/EstimationResult'
import moment from 'moment'

interface Total {
  wattHours: number
  co2e: number
}

type Totals = { [key: string]: Total }

const initialTotals = () => ({
  ebs: {
    wattHours: 0,
    co2e: 0,
  },
  s3: {
    wattHours: 0,
    co2e: 0,
  },
  ec2: {
    wattHours: 0,
    co2e: 0,
  },
  elasticache: {
    wattHours: 0,
    co2e: 0,
  },
  sum: {
    wattHours: 0,
    co2e: 0,
  },
})

const displayDate = (timestamp: Date) => moment(timestamp).utc().format('YYYY-MM-DD')
const displayWattHours = (wattHours: number) => `${wattHours.toFixed(2)} Watts`
const displayCo2e = (co2e: number) => `${co2e.toFixed(6)} Kg CO2e`
const displayService = (totals: Totals, serviceName: string) => [
  displayWattHours(totals[serviceName].wattHours),
  displayCo2e(totals[serviceName].co2e),
]

export default function EmissionsTable(
  estimations: EstimationResult[],
  serviceNames = ['ebs', 's3', 'ec2', 'elasticache'],
): { table: string[][]; colWidths: number[] } {
  const headers = ['Date (UTC)']
  const colWidths: number[] = [15]

  serviceNames.forEach((serviceName) => {
    headers.push(`${serviceName.toUpperCase()} Wattage`, `${serviceName.toUpperCase()} CO2e Emissions`)
    colWidths.push(20, 25)
  })

  headers.push(`SUM Wattage`, `SUM CO2e Emissions`)
  colWidths.push(20, 25)

  const table: string[][] = [headers]

  const grandTotals: Totals = initialTotals()

  estimations.sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))

  estimations.forEach((estimationResult) => {
    const subTotals: Totals = initialTotals()

    estimationResult.estimates.forEach((estimate) => {
      grandTotals[estimate.serviceName].wattHours += estimate.wattHours
      grandTotals['sum'].wattHours += estimate.wattHours
      subTotals[estimate.serviceName].wattHours = estimate.wattHours
      subTotals['sum'].wattHours += estimate.wattHours

      grandTotals[estimate.serviceName].co2e += estimate.co2e
      grandTotals['sum'].co2e += estimate.co2e
      subTotals[estimate.serviceName].co2e = estimate.co2e
      subTotals['sum'].co2e += estimate.co2e
    })

    table.push([
      displayDate(estimationResult.timestamp),
      ...serviceNames.map((serviceName) => displayService(subTotals, serviceName)).flat(),
      ...displayService(subTotals, 'sum'),
    ])
  })

  table.push([
    'Total',
    ...serviceNames.map((serviceName) => displayService(grandTotals, serviceName)).flat(),
    ...displayService(grandTotals, 'sum'),
  ])

  return { table, colWidths }
}
