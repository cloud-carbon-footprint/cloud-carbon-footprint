/*
 * © 2021 Thoughtworks, Inc.
 */

import { EstimationResult } from '@cloud-carbon-footprint/common'
import EmissionsByServiceTable from '../EmissionsByServiceTable'
import moment = require('moment')

describe('EmissionsByServiceTable', () => {
  const timestamp1 = moment('2020-07-10').toDate()
  const timestamp2 = moment('2020-07-09').toDate()
  const testAccountId = 'test account id'
  const testAccountName = 'test account'
  const region = 'us-east-1'

  const input: EstimationResult[] = [
    {
      timestamp: timestamp1,
      serviceEstimates: [
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'EBS',
          kilowattHours: 1,
          co2e: 1,
          cost: 5,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'S3',
          kilowattHours: 2,
          co2e: 2,
          cost: 5,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'EC2',
          kilowattHours: 3,
          co2e: 3,
          cost: 5,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'ElastiCache',
          kilowattHours: 4,
          co2e: 4,
          cost: 5,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'RDS',
          kilowattHours: 4,
          co2e: 4,
          cost: 5,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'Lambda',
          kilowattHours: 100,
          co2e: 100,
          cost: 5,
          region: region,
          usesAverageCPUConstant: false,
        },
      ],
    },
    {
      timestamp: timestamp2,
      serviceEstimates: [
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'EBS',
          kilowattHours: 7,
          co2e: 8,
          cost: 9,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'S3',
          kilowattHours: 55,
          co2e: 1,
          cost: 9,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'EC2',
          kilowattHours: 90,
          co2e: 77,
          cost: 9,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'ElastiCache',
          kilowattHours: 747,
          co2e: 787,
          cost: 9,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'RDS',
          kilowattHours: 747,
          co2e: 787,
          cost: 9,
          region: region,
          usesAverageCPUConstant: false,
        },
        {
          cloudProvider: 'aws',
          accountId: testAccountId,
          accountName: testAccountName,
          serviceName: 'Lambda',
          kilowattHours: 200,
          co2e: 300,
          cost: 10,
          region: region,
          usesAverageCPUConstant: false,
        },
      ],
    },
  ]

  let result: { table: string[][]; colWidths: number[] }

  beforeEach(() => {
    result = EmissionsByServiceTable(input)
  })

  it('prints out the given estimation results grouped by service', () => {
    expect(result.table).toEqual([
      ['Service', 'kilowatt hours', 'metric tons CO2e Emissions', 'Cost'],
      ['EBS', '8.00', '9.000000', '$14.00'],
      ['S3', '57.00', '3.000000', '$14.00'],
      ['EC2', '93.00', '80.000000', '$14.00'],
      ['ElastiCache', '751.00', '791.000000', '$14.00'],
      ['RDS', '751.00', '791.000000', '$14.00'],
      ['Lambda', '300.00', '400.000000', '$15.00'],
      ['Total', '1960.00', '2074.000000', '$85.00'],
    ])
  })

  it('does the right columns', () => {
    expect(result.colWidths).toEqual([15, 20, 25, 20])
  })
})
