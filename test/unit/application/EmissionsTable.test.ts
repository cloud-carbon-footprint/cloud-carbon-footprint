import { EstimationResult } from '@application/EstimationResult'
import EmissionsTable from '@application/EmissionsTable'
import moment = require('moment')

describe('EmissionsTable', () => {
  it('prints out the given estimation results grouped by date', () => {
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

    const result: string = EmissionsTable(input)

    expect(result).toMatchSnapshot()
  })
})
