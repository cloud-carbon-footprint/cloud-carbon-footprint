import AWS from 'aws-sdk'
import AWSMock from 'aws-sdk-mock'
import { RDSStorage } from '@services/RDSStorage'

function buildCostExplorerGetUsageHoursRequest(start: string, end: string) {
  return {
    TimePeriod: {
      Start: start,
      End: end,
    },
    Filter: {
      And: [
        { Dimensions: { Key: 'REGION', Values: ['us-west-1'] } },
        {
          Dimensions: {
            Key: 'USAGE_TYPE_GROUP',
            Values: ['RDS: Storage'],
          },
        },
      ],
    },
    Granularity: 'DAILY',
    GroupBy: [
      {
        Key: 'USAGE_TYPE',
        Type: 'DIMENSION',
      },
    ],
    Metrics: ['UsageQuantity'],
  }
}

function buildCostExplorerGetUsageHoursResponse(data: { start: string; value: number }[]) {
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
            Metrics: {
              UsageQuantity: {
                Amount: value.toString(),
              },
            },
          },
        ],
      }
    }),
  }
}
// TODO: Test later
// {
//   Keys: ['USW1-RDS:IO-Storage'],
//   Metrics: {
//     UsageQuantity: {
//       Amount: '0.16332',
//     },
//   },
// },

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
        expect(params).toEqual(buildCostExplorerGetUsageHoursRequest(startDate, endDate))
        callback(
          null,
          buildCostExplorerGetUsageHoursResponse([
            { start: '2020-07-24', value: 1 },
            { start: '2020-07-25', value: 2 },
          ]),
        )
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate))

    expect(result).toEqual([
      {
        sizeGb: 31,
        timestamp: new Date('2020-07-24'),
      },
      {
        sizeGb: 62,
        timestamp: new Date('2020-07-25'),
      },
    ])
  })

  it('calculates GB-Month for shorter months', async () => {
    const startDate = '2020-06-24'
    const endDate = '2020-06-26'
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(buildCostExplorerGetUsageHoursRequest(startDate, endDate))
        callback(null, buildCostExplorerGetUsageHoursResponse([{ start: '2020-06-24', value: 1.0 }]))
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate))

    expect(result).toEqual([
      {
        sizeGb: 30,
        timestamp: new Date('2020-06-24'),
      },
    ])
  })
})
