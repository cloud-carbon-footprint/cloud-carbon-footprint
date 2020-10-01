import { EstimationResult } from '@application/EstimationResult'
import EmissionsByDayTable from '@view/EmissionsByDayTable'
import moment = require('moment')

describe('EmissionsByDayTable', () => {
  const region = 'us-east-1'
  const timestamp = moment('2020-07-10').toDate()

  const input: EstimationResult[] = [
    {
      timestamp: timestamp,
      serviceEstimates: [
        {
          cloudProvider: 'aws',
          serviceName: 'ebs',
          wattHours: 1,
          co2e: 1,
          cost: 0,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 's3',
          wattHours: 2,
          co2e: 2,
          cost: 0,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'ec2',
          wattHours: 3,
          co2e: 3,
          cost: 0,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'elasticache',
          wattHours: 4,
          co2e: 4,
          cost: 0,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'rds',
          wattHours: 4,
          co2e: 4,
          cost: 0,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'lambda',
          wattHours: 1,
          co2e: 1,
          cost: 0,
          region: region,
          usesAverageCPUConstant: false,
        },
      ],
    },
    {
      timestamp: moment('2020-07-09').toDate(),
      serviceEstimates: [
        {
          cloudProvider: 'aws',
          serviceName: 'ebs',
          wattHours: 7,
          co2e: 8,
          cost: 6,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 's3',
          wattHours: 55,
          co2e: 1,
          cost: 6,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'ec2',
          wattHours: 90,
          co2e: 77,
          cost: 6,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'elasticache',
          wattHours: 747,
          co2e: 787,
          cost: 6,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'rds',
          wattHours: 747,
          co2e: 787,
          cost: 6,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          serviceName: 'lambda',
          wattHours: 300,
          co2e: 300,
          cost: 6,
          region: region,
          usesAverageCPUConstant: false,
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
      ['2020-07-10', '15.00', '15.000000'],
      ['2020-07-09', '1946.00', '1960.000000'],
      ['Total', '1961.00', '1975.000000'],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25])
  })
})
