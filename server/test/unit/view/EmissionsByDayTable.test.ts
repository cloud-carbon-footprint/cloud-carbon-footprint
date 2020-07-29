import { EstimationResult } from '@application/EstimationResult'
import EmissionsByDayTable from '@view/EmissionsByDayTable'
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
    result = EmissionsByDayTable(input)
  })

  it('prints out the given estimation results grouped by date', () => {
    expect(result.table).toEqual([
      [
        'Date (UTC)',
        'EBS Wattage',
        'EBS CO2e Emissions',
        'S3 Wattage',
        'S3 CO2e Emissions',
        'EC2 Wattage',
        'EC2 CO2e Emissions',
        'ELASTICACHE Wattage',
        'ELASTICACHE CO2e Emissions',
        'SUM Wattage',
        'SUM CO2e Emissions',
      ],
      [
        '2020-07-09',
        '7.00 Watts',
        '8.000000 Kg CO2e',
        '55.00 Watts',
        '1.000000 Kg CO2e',
        '90.00 Watts',
        '77.000000 Kg CO2e',
        '747.00 Watts',
        '787.000000 Kg CO2e',
        '899.00 Watts',
        '873.000000 Kg CO2e',
      ],
      [
        '2020-07-10',
        '1.00 Watts',
        '1.000000 Kg CO2e',
        '2.00 Watts',
        '2.000000 Kg CO2e',
        '3.00 Watts',
        '3.000000 Kg CO2e',
        '4.00 Watts',
        '4.000000 Kg CO2e',
        '10.00 Watts',
        '10.000000 Kg CO2e',
      ],
      [
        'Total',
        '8.00 Watts',
        '9.000000 Kg CO2e',
        '57.00 Watts',
        '3.000000 Kg CO2e',
        '93.00 Watts',
        '80.000000 Kg CO2e',
        '751.00 Watts',
        '791.000000 Kg CO2e',
        '909.00 Watts',
        '883.000000 Kg CO2e',
      ],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25, 20, 25, 20, 25, 20, 25, 20, 25])
  })
})
