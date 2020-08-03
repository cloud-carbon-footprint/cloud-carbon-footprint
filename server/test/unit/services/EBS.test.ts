import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

import EBS from '@services/EBS'
import { AWS_REGIONS } from '@domain/constants'

beforeAll(() => {
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
            Dimensions: {
              Key: 'USAGE_TYPE',
              Values: ['EBS:VolumeUsage.gp2'],
            },
          },
          Granularity: 'DAILY',
          Metrics: ['UsageQuantity'],
          TimePeriod: {
            End: '2020-06-30',
            Start: '2020-06-27',
          },
        })

        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-06-27T00:00:00Z'), new Date('2020-06-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no usage', async () => {
    // for valid date ranges, getCostAndUsage API will always return results for the date range, but with all zero usages
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '0',
                  Unit: 'GB-Month',
                },
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('returns empty list when no ResultsByTime', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {})
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([])
  })

  it('returns empty list when empty ResultsByTime', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([])
  })

  it('filters out results with no TimePeriod', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              Total: {
                UsageQuantity: {
                  Amount: '0',
                  Unit: 'GB-Month',
                },
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no StartDate', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
              },
              Total: {
                UsageQuantity: {
                  Amount: '0',
                  Unit: 'GB-Month',
                },
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no Total', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no UsageQuantity', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          ResultsByTime: [
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {},
            },
            {
              Estimated: false,
              Groups: [],
              TimePeriod: {
                End: '2020-06-28',
                Start: '2020-06-27',
              },
              Total: {
                UsageQuantity: {
                  Amount: '1.2120679',
                  Unit: 'GB-Month',
                },
              },
            },
          ],
        })
      },
    )

    const ebsService = new EBS()

    const result = await ebsService.getUsage(new Date('2020-01-27T00:00:00Z'), new Date('2020-01-30T00:00:00Z'))

    expect(result).toEqual([
      {
        sizeGb: 36.362037,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
    ])
  })

  it('filters out results with no Amount', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildAwsCostExplorerGetCostAndUsageResponse([
            { start: '2020-06-27', value: undefined },
            { start: '2020-06-27', value: '1.2120679' },
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
      },
    ])
  })

  it('', async () => {
    const params = {
      TimePeriod: {
        Start: '2020-08-01',
        End: '2020-08-03',
      },
      Filter: {
        Dimensions: {
          Key: 'USAGE_TYPE',
          Values: ['EBS:VolumeUsage.gp2'],
        },
      },
      Granularity: 'DAILY',
      Metrics: [
        'UsageQuantity',
        /* more items */
      ],
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
      // NextPageToken: 'STRING_VALUE'
    }

    const costExplorer = new AWS.CostExplorer({
      region: AWS_REGIONS.US_EAST_1, //must be us-east-1 to work
    })
    const response = await costExplorer.getCostAndUsage(params).promise()
    console.log(response)
  })
})

function buildAwsCostExplorerGetCostAndUsageResponse(data: { start: string; value: string }[]) {
  return {
    GroupDefinitions: [
      {
        Type: 'DIMENSION',
        Key: 'USAGE_TYPE',
      },
    ],
    ResultsByTime: data.map(({ start, value }) => {
      return {
        TimePeriod: {
          Start: start,
        },
        Groups: [
          {
            Keys: ['EBS:VolumeUsage.gp2'],
            Metrics: { UsageQuantity: { Amount: value, Unit: 'GB-Month' } },
          },
        ],
      }
    }),
  }
}
