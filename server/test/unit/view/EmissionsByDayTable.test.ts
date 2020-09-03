import { RegionResult } from '@application/EstimationResult'
import EmissionsByDayTable from '@view/EmissionsByDayTable'
import moment = require('moment')

describe('EmissionsByDayTable', () => {
  const region = 'us-east-1'
  const timestamp = moment('2020-07-10').toDate()

  const input: RegionResult[] = [
    {
      region: region,
      serviceResults: [
        {
          serviceName: 'ebs',
          estimationResults: [
            {
              timestamp: timestamp,
              serviceData: [
                {
                  wattHours: 1,
                  co2e: 1,
                  cost: 0,
                },
              ],
            },
            {
              timestamp: moment('2020-07-09').toDate(),
              serviceData: [
                {
                  wattHours: 7,
                  co2e: 8,
                  cost: 6,
                },
              ],
            },
          ],
        },
        {
          serviceName: 's3',
          estimationResults: [
            {
              timestamp: timestamp,
              serviceData: [
                {
                  wattHours: 2,
                  co2e: 2,
                  cost: 0,
                },
              ],
            },
            {
              timestamp: moment('2020-07-09').toDate(),
              serviceData: [
                {
                  wattHours: 55,
                  co2e: 1,
                  cost: 6,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'ec2',
          estimationResults: [
            {
              timestamp: timestamp,
              serviceData: [
                {
                  wattHours: 3,
                  co2e: 3,
                  cost: 0,
                },
              ],
            },
            {
              timestamp: moment('2020-07-09').toDate(),
              serviceData: [
                {
                  wattHours: 90,
                  co2e: 77,
                  cost: 6,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'elasticache',
          estimationResults: [
            {
              timestamp: timestamp,
              serviceData: [
                {
                  wattHours: 4,
                  co2e: 4,
                  cost: 0,
                },
              ],
            },
            {
              timestamp: moment('2020-07-09').toDate(),
              serviceData: [
                {
                  wattHours: 747,
                  co2e: 787,
                  cost: 6,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'rds',
          estimationResults: [
            {
              timestamp: timestamp,
              serviceData: [
                {
                  wattHours: 4,
                  co2e: 4,
                  cost: 0,
                },
              ],
            },
            {
              timestamp: moment('2020-07-09').toDate(),
              serviceData: [
                {
                  wattHours: 747,
                  co2e: 787,
                  cost: 6,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'lambda',
          estimationResults: [
            {
              timestamp: timestamp,
              serviceData: [
                {
                  wattHours: 1,
                  co2e: 1,
                  cost: 0,
                },
              ],
            },
            {
              timestamp: moment('2020-07-09').toDate(),
              serviceData: [
                {
                  wattHours: 300,
                  co2e: 300,
                  cost: 6,
                },
              ],
            },
          ],
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
