import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import EBS from '@services/EBS'
import { AWS_POWER_USAGE_EFFECTIVENESS, AWS_REGIONS, HDDCOEFFICIENT, SSDCOEFFICIENT } from '@domain/constants'
import { StorageEstimator } from '@domain/StorageEstimator'

beforeAll(() => {
  AWS.config.update({ region: 'us-west-1' })
  AWSMock.setSDKInstance(AWS)
})

describe('Ebs', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('gets EBS usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          Filter: {
            And: [
              {
                Dimensions: {
                  Key: 'USAGE_TYPE_GROUP',
                  Values: [
                    'EC2: EBS - SSD(gp2)',
                    'EC2: EBS - SSD(io1)',
                    'EC2: EBS - HDD(sc1)',
                    'EC2: EBS - HDD(st1)',
                    'EC2: EBS - Magnetic',
                  ],
                },
              },
              { Dimensions: { Key: 'REGION', Values: ['us-west-1'] } },
            ],
          },
          Granularity: 'DAILY',
          Metrics: ['UsageQuantity'],
          TimePeriod: {
            End: '2020-06-30',
            Start: '2020-06-27',
          },
          GroupBy: [
            {
              Key: 'USAGE_TYPE',
              Type: 'DIMENSION',
            },
          ],
        })

        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '1.2120679', types: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const result = await ebsService.getUsage(new Date('2020-06-27T00:00:00Z'), new Date('2020-06-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
        diskType: 'SSD',
      },
    ])
  })

  it('filters out results with no usage', async () => {
    // for valid date ranges, getCostAndUsage API will always return results for the date range, but with all zero usages
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '0', types: ['EBS:VolumeUsage.gp2'] },
            { start: '2020-06-27', value: '1.2120679', types: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
        diskType: 'SSD',
      },
    ])
  })

  it('should return empty array if no usage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildAwsCostExplorerGetCostAndUsageResponse([]))
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([])
  })

  it('filters out results with no Amount', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: undefined, types: ['EBS:VolumeUsage.gp2'] },
            { start: '2020-06-27', value: '1.2120679', types: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
        diskType: 'SSD',
      },
    ])
  })

  it('should calculate EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '1', types: ['EBS:VolumeUsage.st1'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-06-27T00:00:00Z'), new Date('2020-06-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 30,
        timestamp: new Date('2020-06-27T00:00:00Z'),
        diskType: 'HDD',
      },
    ])
  })

  it('should get estimates for ebs st1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '1', types: ['EBS:VolumeUsage.st1'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await ebsService.getEstimates(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      AWS_REGIONS.US_EAST_1,
    )

    expect(result).toEqual(
      hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }], AWS_REGIONS.US_EAST_1),
    )
  })

  it('should get estimates for magnetic EBS HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '1', types: ['EBS:VolumeUsage'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await ebsService.getEstimates(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      AWS_REGIONS.US_EAST_1,
    )

    expect(result).toEqual(
      hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }], AWS_REGIONS.US_EAST_1),
    )
  })

  it('should get estimates for magnetic sc1 HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '1', types: ['EBS:VolumeUsage.sc1'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await ebsService.getEstimates(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      AWS_REGIONS.US_EAST_1,
    )

    expect(result).toEqual(
      hddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }], AWS_REGIONS.US_EAST_1),
    )
  })

  it('should get estimates for EBS SSD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '1', types: ['EBS:VolumeUsage.io1'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const sddStorageEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await ebsService.getEstimates(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      AWS_REGIONS.US_EAST_1,
    )

    expect(result).toEqual(
      sddStorageEstimator.estimate([{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }], AWS_REGIONS.US_EAST_1),
    )
  })

  it('should throw error if unexpected cost explorer volume name', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([{ start: '2020-06-27', value: '1', types: ['EBS:anything'] }]),
        )
      },
    )

    const ebsService = new EBS()
    const sddStorageEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    await expect(
      ebsService.getEstimates(
        new Date('2020-06-27T00:00:00Z'),
        new Date('2020-06-30T00:00:00Z'),
        AWS_REGIONS.US_EAST_1,
      ),
    ).rejects.toThrowError('Unexpected Cost explorer Dimension Name: EBS:anything')
  })

  it('should get estimates for EBS SDD and HDD storage', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: '1', types: ['EBS:VolumeUsage.st1'] },
            { start: '2020-06-27', value: '1', types: ['EBS:VolumeUsage.gp2'] },
          ]),
        )
      },
    )

    const ebsService = new EBS()
    const hddStorageEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    const sddStorageEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)

    const result = await ebsService.getEstimates(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      AWS_REGIONS.US_EAST_1,
    )

    const ssdEstimates = sddStorageEstimator.estimate(
      [{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }],
      AWS_REGIONS.US_EAST_1,
    )
    const hddEstimates = hddStorageEstimator.estimate(
      [{ sizeGb: 30.0, timestamp: new Date('2020-06-27') }],
      AWS_REGIONS.US_EAST_1,
    )
    expect(result).toEqual([
      {
        timestamp: new Date('2020-06-27'),
        wattHours: ssdEstimates[0].wattHours + hddEstimates[0].wattHours,
        co2e: ssdEstimates[0].co2e + hddEstimates[0].co2e,
      },
    ])
  })
})

function buildAwsCostExplorerGetCostAndUsageResponse(data: { start: string; value: string; types: string[] }[]) {
  return {
    GroupDefinitions: [
      {
        Type: 'DIMENSION',
        Key: 'USAGE_TYPE',
      },
    ],
    ResultsByTime: data.map(({ start, value, types }) => {
      return {
        TimePeriod: {
          Start: start,
        },
        Groups: [
          {
            Keys: types,
            Metrics: { UsageQuantity: { Amount: value, Unit: 'GB-Month' } },
          },
        ],
      }
    }),
  }
}
