import AWS from 'aws-sdk'
import AWSMock from 'aws-sdk-mock'
import RDSStorage from '@services/RDSStorage'
import { StorageEstimator } from '@domain/StorageEstimator'
import { AWS_POWER_USAGE_EFFECTIVENESS, HDDCOEFFICIENT, SSDCOEFFICIENT } from '@domain/FootprintEstimationConstants'
import { AWS_REGIONS } from '@services/AWSRegions'
import { buildCostExplorerGetCostResponse, buildCostExplorerGetUsageResponse } from '../../fixtures/builders'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('RDSStorage', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('calculates GB-Month usage', async () => {
    const startDate = '2020-07-24'
    const endDate = '2020-07-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([
            { start: '2020-07-24', amount: 1, keys: ['USW1-RDS:GP2-Storage'] },
            { start: '2020-07-25', amount: 2, keys: ['USW1-RDS:GP2-Storage'] },
          ]),
        )
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate), 'us-east-1')

    expect(result).toEqual([
      {
        diskType: 'SSD',
        sizeGb: 31,
        timestamp: new Date('2020-07-24'),
      },
      {
        diskType: 'SSD',
        sizeGb: 62,
        timestamp: new Date('2020-07-25'),
      },
    ])
  })

  it('should call cost explorer with the expected request', async () => {
    const startDate = '2020-07-24'
    const endDate = '2020-07-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          TimePeriod: {
            Start: startDate,
            End: endDate,
          },
          Filter: {
            And: [
              { Dimensions: { Key: 'REGION', Values: ['us-east-1'] } },
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

    const rdsStorage = new RDSStorage()

    await rdsStorage.getUsage(new Date(startDate), new Date(endDate), 'us-east-1')
  })

  it('calculates GB-Month for shorter months', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: '2020-06-24', amount: 1.0, keys: ['USW1-RDS:GP2-Storage'] }]),
        )
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate), 'us-east-1')

    expect(result).toEqual([
      {
        diskType: 'SSD',
        sizeGb: 30,
        timestamp: new Date('2020-06-24'),
      },
    ])
  })

  it('filters 0 gb of usage', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-25'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: '2020-06-24', amount: 0, keys: ['USW1-RDS:GP2-Storage'] }]),
        )
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate), 'us-east-1')

    expect(result).toEqual([])
  })

  it('should query for the specified region', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-25'
    const expectedRegion = 'us-east-1'

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params.Filter.And).toContainEqual({
          Dimensions: {
            Key: 'REGION',
            Values: [expectedRegion],
          },
        })
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: '2020-06-24', amount: 0, keys: ['USW1-RDS:GP2-Storage'] }]),
        )
      },
    )

    const rdsStorage = new RDSStorage()
    await rdsStorage.getUsage(new Date(startDate), new Date(endDate), 'us-east-1')
  })

  it('should return empty array if no usage', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-25'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
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

    const rdsStorage = new RDSStorage()
    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate), 'us-east-1')

    expect(result).toEqual([])
  })

  it('should get estimates for RDS IOPS SSD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: '2020-06-27', amount: 1, keys: ['USW1-RDS:PIOPS-Storage'] }]),
        )
      },
    )

    const rdsService = new RDSStorage()
    const ssdStorageEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await rdsService.getEstimates(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      AWS_REGIONS.US_EAST_1,
    )

    expect(result).toEqual(
      ssdStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }], AWS_REGIONS.US_EAST_1),
    )
  })

  it('should get estimates for RDS standard HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetUsageResponse([{ start: '2020-06-27', amount: 1, keys: ['USW1-RDS:StorageUsage'] }]),
        )
      },
    )

    const rdsService = new RDSStorage()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await rdsService.getEstimates(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      AWS_REGIONS.US_EAST_1,
    )

    expect(result).toEqual(
      hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }], AWS_REGIONS.US_EAST_1),
    )
  })

  it('should get costs for RDS', async () => {
    const startDate = '2020-07-24'
    const endDate = '2020-07-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetCostResponse([
            { start: '2020-07-24', amount: 0.2, keys: ['USW1-RDS:GP2-Storage'] },
            { start: '2020-07-25', amount: 1.8, keys: ['USW1-RDS:GP2-Storage'] },
          ]),
        )
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getCosts(new Date(startDate), new Date(endDate), 'us-east-1')

    expect(result).toEqual([
      {
        amount: 0.2,
        currency: 'USD',
        timestamp: new Date('2020-07-24'),
      },
      {
        amount: 1.8,
        currency: 'USD',
        timestamp: new Date('2020-07-25'),
      },
    ])
  })
})
