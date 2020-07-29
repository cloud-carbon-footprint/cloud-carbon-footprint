import { EstimationResult } from '@application/EstimationResult'

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
  total: {
    wattHours: 0,
    co2e: 0,
  },
})

const displayServiceName = (serviceName: string): string => {
  const mapping: Record<string, string> = {
    ebs: 'EBS',
    s3: 'S3',
    ec2: 'EC2',
    elasticache: 'ElastiCache',
    total: 'Total',
  }
  return mapping[serviceName]
}

const displayWattHours = (wattHours: number) => wattHours.toFixed(2).toString()
const displayCo2e = (co2e: number) => co2e.toFixed(6).toString()

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
