/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import AWS, { CostExplorer, CloudWatch } from 'aws-sdk'
import AWSMock from 'aws-sdk-mock'
import RDSStorage from '@services/aws/RDSStorage'
import { StorageEstimator } from '@domain/StorageEstimator'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'

import { buildCostExplorerGetCostResponse, buildCostExplorerGetUsageResponse } from '@builders'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('RDSStorage', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  const startDate = '2020-07-24'
  const dayTwo = '2020-07-25'
  const endDate = '2020-07-26'
  const region = 'us-east-1'

  it('calculates GB-Month usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: startDate, amount: 1, keys: ['USW1-RDS:GP2-Storage'] },
            { start: dayTwo, amount: 2, keys: ['USW1-RDS:GP2-Storage'] },
          ]),
        )
      },
    )

    const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual([
      {
        diskType: 'SSD',
        sizeGb: 31,
        timestamp: new Date(startDate),
      },
      {
        diskType: 'SSD',
        sizeGb: 62,
        timestamp: new Date(dayTwo),
      },
    ])
  })

  it('should call cost explorer with the expected request', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          TimePeriod: {
            Start: startDate,
            End: endDate,
          },
          Filter: {
            And: [
              { Dimensions: { Key: 'REGION', Values: [region] } },
              {
                Dimensions: {
                  Key: 'USAGE_TYPE_GROUP',
                  Values: ['RDS: Storage'],
                },
              },
            ],
          },
          Granularity: 'DAILY',
          Metrics: ['UsageQuantity'],
          GroupBy: [
            {
              Key: 'USAGE_TYPE',
              Type: 'DIMENSION',
            },
          ],
        })

        callback(null, buildCostExplorerGetUsageResponse([]))
      },
    )

    const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))

    await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)
  })

  it('calculates GB-Month for shorter months', async () => {
    const juneStartDate = '2020-06-24'
    const juneEndDate = '2020-06-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: juneStartDate, amount: 1.0, keys: ['USW1-RDS:GP2-Storage'] }]),
        )
      },
    )

    const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))

    const result = await rdsStorage.getUsage(new Date(juneStartDate), new Date(juneEndDate), region)

    expect(result).toEqual([
      {
        diskType: 'SSD',
        sizeGb: 30,
        timestamp: new Date(juneStartDate),
      },
    ])
  })

  it('filters 0 gb of usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 0, keys: ['USW1-RDS:GP2-Storage'] }]),
        )
      },
    )

    const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual([])
  })

  it('should query for the specified region', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params.Filter.And).toContainEqual({
          Dimensions: {
            Key: 'REGION',
            Values: [region],
          },
        })
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 0, keys: ['USW1-RDS:GP2-Storage'] }]),
        )
      },
    )

    const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)
  })

  it('should return empty array if no usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startDate,
              },
              Groups: [],
            },
          ],
        })
      },
    )

    const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual([])
  })

  it('should get estimates for RDS IOPS SSD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['USW1-RDS:PIOPS-Storage'] }]),
        )
      },
    )

    const rdsService = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    const ssdStorageEstimator = new StorageEstimator(
      CLOUD_CONSTANTS.AWS.SSDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )

    const result = await rdsService.getEstimates(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual(ssdStorageEstimator.estimate([{ sizeGb: 31.0, timestamp: new Date(startDate) }], region))
  })

  it('should get estimates for RDS standard HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: startDate, amount: 1, keys: ['USW1-RDS:StorageUsage'] }]),
        )
      },
    )

    const rdsService = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    const hddStorageEstimator = new StorageEstimator(
      CLOUD_CONSTANTS.AWS.HDDCOEFFICIENT,
      CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS,
    )

    const result = await rdsService.getEstimates(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual(hddStorageEstimator.estimate([{ sizeGb: 31.0, timestamp: new Date(startDate) }], region))
  })

  it('should get costs for RDS', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetCostResponse([
            { start: startDate, amount: 0.2, keys: ['USW1-RDS:GP2-Storage'] },
            { start: dayTwo, amount: 1.8, keys: ['USW1-RDS:GP2-Storage'] },
          ]),
        )
      },
    )

    const rdsStorage = new RDSStorage(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    const result = await rdsStorage.getCosts(new Date(startDate), new Date(endDate), region)
    expect(result).toEqual([
      {
        amount: 0.2,
        currency: 'USD',
        timestamp: new Date(startDate),
      },
      {
        amount: 1.8,
        currency: 'USD',
        timestamp: new Date(dayTwo),
      },
    ])
  })
})
