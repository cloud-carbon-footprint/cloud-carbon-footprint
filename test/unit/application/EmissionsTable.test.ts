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
        ],
      },
    ]

    const result: string = EmissionsTable(input)

    expect(result).toEqual(
      '| Date (UTC)        | EBS Wattage       | EBS CO2e Emissions          | S3 Wattage        | S3 CO2e Emissions           \n' +
        '| 2020-07-10        | 1.00 Watts        | 1.000000 Kg CO2e            | 2.00 Watts        | 2.000000 Kg CO2e            \n' +
        '| Total             | 1.00 Watts        | 1.000000 Kg CO2e            | 2.00 Watts        | 2.000000 Kg CO2e            ',
    )
  })
})
