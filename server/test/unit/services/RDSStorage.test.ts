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

function buildCostExplorerGetUsageHoursResponse() {
  return {
    GroupDefinitions: [
      {
        Type: 'DIMENSION',
        Key: 'USAGE_TYPE',
      },
    ],
    ResultsByTime: [
      {
        TimePeriod: {
          Start: '2020-07-24',
          End: '2020-07-25',
        },
        Groups: [
          {
            Keys: ['USW1-RDS:GP2-Storage'],
            Metrics: {
              UsageQuantity: {
                Amount: '0.6451612896',
              },
            },
          },
        ],
      },
      {
        TimePeriod: {
          Start: '2020-07-25',
          End: '2020-07-26',
        },
        Groups: [
          {
            Keys: ['USW1-RDS:GP2-Storage'],
            Metrics: {
              UsageQuantity: {
                Amount: '0.16332',
              },
            },
          },
          // TODO: Test later
          // {
          //   Keys: ['USW1-RDS:IO-Storage'],
          //   Metrics: {
          //     UsageQuantity: {
          //       Amount: '0.16332',
          //     },
          //   },
          // },
        ],
      },
    ],
  }
}

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
        callback(null, buildCostExplorerGetUsageHoursResponse())
      },
    )

    const rdsStorage = new RDSStorage()

    const result = await rdsStorage.getUsage(new Date(startDate), new Date(endDate))

    expect(result).toEqual([
      {
        sizeGb: 19.354838687999997,
        timestamp: new Date('2020-07-24'),
      },
      {
        sizeGb: 4.8995999999999995,
        timestamp: new Date('2020-07-25'),
      },
    ])
  })
})
