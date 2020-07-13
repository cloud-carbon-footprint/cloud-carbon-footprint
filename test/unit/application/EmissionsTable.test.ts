import { EstimationResult } from '../../../src/application/EstimationResult'
import moment = require('moment')
import EmissionsTable from '../../../src/application/EmissionsTable'

describe('EmissionsTable', () => {
  it('do', () => {
    const input: EstimationResult[] = [
      {
        timestamp: moment('2020-07-10').toDate(),
        estimates: [
          {
            serviceName: 'ebs',
            wattHours: 1,
            co2e: 1,
          },
        ],
      },
    ]

    const result: string = EmissionsTable(input)

    expect(result).toEqual(
      '┌────────────────────┬────────────────────┬──────────────────────────────┐\n' +
        '│ Date (UTC)         │ EBS Wattage        │ EBS CO2e Emissions           │\n' +
        '├────────────────────┼────────────────────┼──────────────────────────────┤\n' +
        '│ 2020-07-10         │ 1.00 Watts         │ 1.000000 Kg CO2e             │\n' +
        '├────────────────────┼────────────────────┼──────────────────────────────┤\n' +
        '│ Total              │ 1.00 Watts         │ 1.000000 Kg CO2e             │\n' +
        '└────────────────────┴────────────────────┴──────────────────────────────┘',
    )
  })
})
