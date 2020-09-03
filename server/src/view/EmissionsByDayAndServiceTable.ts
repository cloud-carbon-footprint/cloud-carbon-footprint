import { displayCo2e, displayServiceName, displayWattHours, initialTotals, Totals } from '@view/EmissionsTableUtils'
import { CURRENT_SERVICES } from '@application/Config.json'
import { pluck } from 'ramda'
import moment from 'moment'
import { RegionResult } from '@application/EstimationResult'

const displayDate = (timestamp: Date) => moment(timestamp).utc().format('YYYY-MM-DD')
const displayService = (totals: Totals, serviceName: string) => [
  displayWattHours(totals[serviceName].wattHours),
  displayCo2e(totals[serviceName].co2e),
]

export default function EmissionsByDayAndServiceTable(
  regionResults: RegionResult[],
  serviceNames = pluck('key', CURRENT_SERVICES),
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

  const dataByDate = new Map()

  regionResults.forEach((regionResult) => {
    regionResult.serviceResults.forEach((serviceResult) => {
      const serviceName: string = serviceResult.serviceName

      serviceResult.estimationResults.forEach((estimationResult) => {
        const dateAsString = estimationResult.timestamp.toISOString().substr(0, 10)

        if (!dataByDate.has(dateAsString)) {
          dataByDate.set(dateAsString, initialTotals())
        }

        estimationResult.serviceData.forEach((usage) => {
          const subTotals = dataByDate.get(dateAsString)

          subTotals[serviceName].wattHours += usage.wattHours
          subTotals[serviceName].co2e += usage.co2e
          subTotals['total'].wattHours += usage.wattHours
          subTotals['total'].co2e += usage.co2e

          grandTotals[serviceName].wattHours += usage.wattHours
          grandTotals[serviceName].co2e += usage.co2e
          grandTotals['total'].wattHours += usage.wattHours
          grandTotals['total'].co2e += usage.co2e

          dataByDate.set(dateAsString, subTotals)
        })
      })
    })
  })

  const rowsToInsert: string[][] = []
  dataByDate.forEach((subtotal, timestamp) => {
    rowsToInsert.push([
      displayDate(new Date(timestamp)),
      ...serviceNames.map((serviceName) => displayService(subtotal, serviceName)).flat(),
      ...displayService(subtotal, 'total'),
    ])
  })
  rowsToInsert.sort((a, b) => (new Date(a[0]) < new Date(b[0]) ? -1 : 1))
  rowsToInsert.forEach((row) => table.push(row))

  table.push([
    'Total',
    ...serviceNames.map((serviceName) => displayService(grandTotals, serviceName)).flat(),
    ...displayService(grandTotals, 'total'),
  ])

  return { table, colWidths }
}
