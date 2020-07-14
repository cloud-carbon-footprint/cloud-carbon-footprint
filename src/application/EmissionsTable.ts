import { EstimationResult } from './EstimationResult'
import * as console from 'console'
import Table from 'cli-table'
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
})

const displayWattHours = (wattHours: number) => `${wattHours.toFixed(2)} Watts`
const displayCo2e = (co2e: number) => `${co2e.toFixed(6)} Kg CO2e`

export default function EmissionsTable(estimations: EstimationResult[]): string {
  const table = new Table({
    head: ['Date (UTC)', 'EBS Wattage', 'EBS CO2e Emissions'],
    colWidths: [20, 20, 30],
  })

  const grandTotals: Totals = initialTotals()

  estimations.forEach((estimationResult) => {
    const subTotals: Totals = initialTotals()

    estimationResult.estimates.forEach((estimate) => {
      grandTotals[estimate.serviceName].wattHours += estimate.wattHours
      subTotals[estimate.serviceName].wattHours += estimate.wattHours
      grandTotals[estimate.serviceName].co2e += estimate.co2e
      subTotals[estimate.serviceName].co2e += estimate.co2e
    })

    table.push([
      moment(estimationResult.timestamp).utc().format('YYYY-MM-DD'),
      displayWattHours(subTotals['ebs'].wattHours),
      displayCo2e(subTotals['ebs'].co2e),
    ])
  })

  table.push(['Total', displayWattHours(grandTotals['ebs'].wattHours), displayCo2e(grandTotals['ebs'].co2e)])

  return table.toString()
}
