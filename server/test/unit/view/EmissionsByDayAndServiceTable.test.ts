import { EstimationResult } from '@application/EstimationResult'
import EmissionsByDayAndServiceTable from '@view/EmissionsByDayAndServiceTable'
import moment = require('moment')

describe('EmissionsTable', () => {
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
        {
          serviceName: 'rds',
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
        {
          serviceName: 'rds',
          wattHours: 747,
          co2e: 787,
        },
      ],
    },
  ]

  let result: { table: string[][]; colWidths: number[] }

  beforeEach(() => {
    result = EmissionsByDayAndServiceTable(input)
  })

  it('prints out the given estimation results grouped by date', () => {
    expect(result.table).toEqual([
      [
        'Date (UTC)',
        'EBS Watt Hours',
        'EBS Kg CO2e Emissions',
        'S3 Watt Hours',
        'S3 Kg CO2e Emissions',
        'EC2 Watt Hours',
        'EC2 Kg CO2e Emissions',
        'ElastiCache Watt Hours',
        'ElastiCache Kg CO2e Emissions',
        'RDS Watt Hours',
        'RDS Kg CO2e Emissions',
        'SUM Watt Hours',
        'SUM Kg CO2e Emissions',
      ],
      [
        '2020-07-09',
        '7.00',
        '8.000000',
        '55.00',
        '1.000000',
        '90.00',
        '77.000000',
        '747.00',
        '787.000000',
        '747.00',
        '787.000000',
        '1646.00',
        '1660.000000',
      ],
      [
        '2020-07-10',
        '1.00',
        '1.000000',
        '2.00',
        '2.000000',
        '3.00',
        '3.000000',
        '4.00',
        '4.000000',
        '4.00',
        '4.000000',
        '14.00',
        '14.000000',
      ],
      [
        'Total',
        '8.00',
        '9.000000',
        '57.00',
        '3.000000',
        '93.00',
        '80.000000',
        '751.00',
        '791.000000',
        '751.00',
        '791.000000',
        '1660.00',
        '1674.000000',
      ],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25, 20, 25, 20, 25, 20, 25, 20, 25, 20, 25])
  })
})
