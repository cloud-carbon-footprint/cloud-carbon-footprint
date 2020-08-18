import { EstimationResult } from '@application/EstimationResult'
import EmissionsByDayTable from '@view/EmissionsByDayTable'
import moment = require('moment')

describe('EmissionsByDayTable', () => {
  const input: EstimationResult[] = [
    {
      timestamp: moment('2020-07-10').toDate(),
      serviceEstimates: [
        {
          serviceName: 'ebs',
          wattHours: 1,
          co2e: 1,
          cost: 0,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 's3',
          wattHours: 2,
          co2e: 2,
          cost: 0,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 'ec2',
          wattHours: 3,
          co2e: 3,
          cost: 0,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 'elasticache',
          wattHours: 4,
          co2e: 4,
          cost: 0,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 'rds',
          wattHours: 4,
          co2e: 4,
          cost: 0,
          timestamp: moment('2020-07-10').toDate(),
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
          cost: 6,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 's3',
          wattHours: 55,
          co2e: 1,
          cost: 6,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 'ec2',
          wattHours: 90,
          co2e: 77,
          cost: 6,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 'elasticache',
          wattHours: 747,
          co2e: 787,
          cost: 6,
          timestamp: moment('2020-07-10').toDate(),
        },
        {
          serviceName: 'rds',
          wattHours: 747,
          co2e: 787,
          cost: 6,
          timestamp: moment('2020-07-10').toDate(),
        },
      ],
    },
  ]

  let result: { table: string[][]; colWidths: number[] }

  beforeEach(() => {
    result = EmissionsByDayTable(input)
  })

  it('prints out the given estimation results grouped by service', () => {
    expect(result.table).toEqual([
      ['Date', 'Watt Hours', 'Kg CO2e Emissions'],
      ['2020-07-10', '14.00', '14.000000'],
      ['2020-07-09', '1646.00', '1660.000000'],
      ['Total', '1660.00', '1674.000000'],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25])
  })
})
