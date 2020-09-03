import { RegionResult } from '@application/EstimationResult'
import EmissionsByDayAndServiceTable from '@view/EmissionsByDayAndServiceTable'
import moment = require('moment')

describe('EmissionsTable', () => {
  const timestamp1 = moment('2020-07-10').toDate()
  const timestamp2 = moment('2020-07-09').toDate()
  const region = 'us-east-1'

  const input: RegionResult[] = [
    {
      region: region,
      serviceResults: [
        {
          serviceName: 'ebs',
          estimationResults: [
            {
              timestamp: timestamp1,
              serviceData: [
                {
                  wattHours: 1,
                  co2e: 1,
                  cost: 7,
                },
              ],
            },
            {
              timestamp: timestamp2,
              serviceData: [
                {
                  wattHours: 7,
                  co2e: 8,
                  cost: 7,
                },
              ],
            },
          ],
        },
        {
          serviceName: 's3',
          estimationResults: [
            {
              timestamp: timestamp1,
              serviceData: [
                {
                  wattHours: 2,
                  co2e: 2,
                  cost: 7,
                },
              ],
            },
            {
              timestamp: timestamp2,
              serviceData: [
                {
                  wattHours: 55,
                  co2e: 1,
                  cost: 7,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'ec2',
          estimationResults: [
            {
              timestamp: timestamp1,
              serviceData: [
                {
                  wattHours: 3,
                  co2e: 3,
                  cost: 7,
                },
              ],
            },
            {
              timestamp: timestamp2,
              serviceData: [
                {
                  wattHours: 90,
                  co2e: 77,
                  cost: 7,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'elasticache',
          estimationResults: [
            {
              timestamp: timestamp1,
              serviceData: [
                {
                  wattHours: 4,
                  co2e: 4,
                  cost: 7,
                },
              ],
            },
            {
              timestamp: timestamp2,
              serviceData: [
                {
                  wattHours: 747,
                  co2e: 787,
                  cost: 7,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'rds',
          estimationResults: [
            {
              timestamp: timestamp1,
              serviceData: [
                {
                  wattHours: 4,
                  co2e: 4,
                  cost: 7,
                },
              ],
            },
            {
              timestamp: timestamp2,
              serviceData: [
                {
                  wattHours: 747,
                  co2e: 787,
                  cost: 7,
                },
              ],
            },
          ],
        },
        {
          serviceName: 'lambda',
          estimationResults: [
            {
              timestamp: timestamp1,
              serviceData: [
                {
                  wattHours: 1,
                  co2e: 1,
                  cost: 7,
                },
              ],
            },
            {
              timestamp: timestamp2,
              serviceData: [
                {
                  wattHours: 300,
                  co2e: 300,
                  cost: 7,
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
        'Lambda Watt Hours',
        'Lambda Kg CO2e Emissions',
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
        '300.00',
        '300.000000',
        '1946.00',
        '1960.000000',
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
        '1.00',
        '1.000000',
        '15.00',
        '15.000000',
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
        '301.00',
        '301.000000',
        '1961.00',
        '1975.000000',
      ],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25, 20, 25, 20, 25, 20, 25, 20, 25, 20, 25, 20, 25])
  })
})
