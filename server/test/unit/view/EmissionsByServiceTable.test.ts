import { EstimationResult } from '@application/EstimationResult'
import moment = require('moment')
import EmissionsByServiceTable from '@view/EmissionsByServiceTable'

describe('EmissionsByServiceTable', () => {
  const input: EstimationResult[] = [
    {
      timestamp: moment('2020-07-10').toDate(),
      estimates: [
        {
          serviceName: 'ebs',
          wattHours: 1,
          co2e: 1,
        },
        {
          serviceName: 's3',
          wattHours: 2,
          co2e: 2,
        },
        {
          serviceName: 'ec2',
          wattHours: 3,
          co2e: 3,
        },
        {
          serviceName: 'elasticache',
          wattHours: 4,
          co2e: 4,
        },
      ],
    },
    {
      timestamp: moment('2020-07-09').toDate(),
      estimates: [
        {
          serviceName: 'ebs',
          wattHours: 7,
          co2e: 8,
        },
        {
          serviceName: 's3',
          wattHours: 55,
          co2e: 1,
        },
        {
          serviceName: 'ec2',
          wattHours: 90,
          co2e: 77,
        },
        {
          serviceName: 'elasticache',
          wattHours: 747,
          co2e: 787,
        },
      ],
    },
  ]

  let result: { table: string[][]; colWidths: number[] }

  beforeEach(() => {
    result = EmissionsByServiceTable(input)
  })

  it('prints out the given estimation results grouped by service', () => {
    expect(result.table).toEqual([
      ['Service', 'Watt Hours', 'Kg CO2e Emissions'],
      ['EBS', '8.00', '9.000000'],
      ['S3', '57.00', '3.000000'],
      ['EC2', '93.00', '80.000000'],
      ['ElastiCache', '751.00', '791.000000'],
      ['Total', '909.00', '883.000000'],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25])
  })
})
