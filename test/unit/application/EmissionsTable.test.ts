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
        ],
      },
    ]

    const result: string = EmissionsTable(input)

    expect(result).toEqual(
      '| Date (UTC)   | EBS Wattage  | EBS CO2e Emissions     | S3 Wattage   | S3 CO2e Emissions      | EC2 Wattage  | EC2 CO2e Emissions     | Sum Wattage  | Sum CO2e Emissions     \n' +
        '| 2020-07-09   | 7.00 Watts   | 8.000000 Kg CO2e       | 55.00 Watts  | 1.000000 Kg CO2e       | 90.00 Watts  | 77.000000 Kg CO2e      | 152.00 Watts | 86.000000 Kg CO2e      \n' +
        '| 2020-07-10   | 1.00 Watts   | 1.000000 Kg CO2e       | 2.00 Watts   | 2.000000 Kg CO2e       | 3.00 Watts   | 3.000000 Kg CO2e       | 6.00 Watts   | 6.000000 Kg CO2e       \n' +
        '| Total        | 8.00 Watts   | 9.000000 Kg CO2e       | 57.00 Watts  | 3.000000 Kg CO2e       | 93.00 Watts  | 80.000000 Kg CO2e      | 158.00 Watts | 92.000000 Kg CO2e      ',
    )
  })
})
