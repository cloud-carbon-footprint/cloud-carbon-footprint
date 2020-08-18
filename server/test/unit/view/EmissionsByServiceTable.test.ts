import { EstimationResult } from '@application/EstimationResult'
import EmissionsByServiceTable from '@view/EmissionsByServiceTable'
import moment = require('moment')

describe('EmissionsByServiceTable', () => {
  const input: EstimationResult[] = [
    {
      timestamp: moment('2020-07-10').toDate(),
      serviceEstimates: [
        {
          serviceName: 'ebs',
          wattHours: 1,
          co2e: 1,
          timestamp: moment('2020-07-10').toDate(),
          cost: 5,
        },
        {
          serviceName: 's3',
          wattHours: 2,
          co2e: 2,
          timestamp: moment('2020-07-10').toDate(),
          cost: 5,
        },
        {
          serviceName: 'ec2',
          wattHours: 3,
          co2e: 3,
          timestamp: moment('2020-07-10').toDate(),
          cost: 5,
        },
        {
          serviceName: 'elasticache',
          wattHours: 4,
          co2e: 4,
          timestamp: moment('2020-07-10').toDate(),
          cost: 5,
        },
        {
          serviceName: 'rds',
          wattHours: 4,
          co2e: 4,
          timestamp: moment('2020-07-10').toDate(),
          cost: 5,
        },
        {
          serviceName: 'lambda',
          wattHours: 100,
          co2e: 100,
          timestamp: moment('2020-07-10').toDate(),
          cost: 5,
        },
      ],
    },
    {
      timestamp: moment('2020-07-09').toDate(),
      serviceEstimates: [
        {
          serviceName: 'ebs',
          wattHours: 7,
          co2e: 8,
          timestamp: moment('2020-07-09').toDate(),
          cost: 9,
        },
        {
          serviceName: 's3',
          wattHours: 55,
          co2e: 1,
          timestamp: moment('2020-07-09').toDate(),
          cost: 9,
        },
        {
          serviceName: 'ec2',
          wattHours: 90,
          co2e: 77,
          timestamp: moment('2020-07-09').toDate(),
          cost: 9,
        },
        {
          serviceName: 'elasticache',
          wattHours: 747,
          co2e: 787,
          timestamp: moment('2020-07-09').toDate(),
          cost: 9,
        },
        {
          serviceName: 'rds',
          wattHours: 747,
          co2e: 787,
          timestamp: moment('2020-07-09').toDate(),
          cost: 9,
        },
        {
          serviceName: 'lambda',
          wattHours: 200,
          co2e: 300,
          timestamp: moment('2020-07-09').toDate(),
          cost: 10,
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
      ['Service', 'Watt Hours', 'Kg CO2e Emissions', 'Cost'],
      ['EBS', '8.00', '9.000000', '$14.00'],
      ['S3', '57.00', '3.000000', '$14.00'],
      ['EC2', '93.00', '80.000000', '$14.00'],
      ['ElastiCache', '751.00', '791.000000', '$14.00'],
      ['RDS', '751.00', '791.000000', '$14.00'],
      ['Lambda',  '300.00', '400.000000', '$15.00'],
      ['Total', '1960.00', '2074.000000', '$85.00'],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25, 20])
  })
})
