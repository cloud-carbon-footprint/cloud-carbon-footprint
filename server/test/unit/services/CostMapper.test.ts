import { getCostFromCostExplorer } from '@services/aws/CostMapper'
import { AWS_REGIONS } from '@services/aws/AWSRegions'
import AWSMock from 'aws-sdk-mock'
import { CostExplorer } from 'aws-sdk'
import { GetCostAndUsageRequest, GetCostAndUsageResponse } from 'aws-sdk/clients/costexplorer'

const startDate = '2020-08-06'
const endDate = '2020-08-07'

describe('CostMapper', function () {
  it('calculates cost ', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, buildResponseBody())
      },
    )

    const costs = await getCostFromCostExplorer(buildRequestParams(), AWS_REGIONS.US_EAST_1)

    expect(costs).toEqual([
      { amount: 2.3081821243, currency: 'USD', timestamp: new Date(startDate) },
      { amount: 1.5, currency: 'USD', timestamp: new Date(startDate) },
    ])
  })
})

function buildRequestParams(): GetCostAndUsageRequest {
  return {
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
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
        { Dimensions: { Key: 'REGION', Values: [AWS_REGIONS.US_EAST_1] } },
      ],
    },
    Granularity: 'DAILY',
    Metrics: ['AmortizedCost'],
    GroupBy: [
      {
        Key: 'USAGE_TYPE',
        Type: 'DIMENSION',
      },
    ],
  }
}

function buildResponseBody(): GetCostAndUsageResponse {
  return {
    ResultsByTime: [
      {
        TimePeriod: { Start: startDate, End: endDate },
        Total: {},
        Groups: [
          {
            Keys: ['EBS:VolumeUsage.gp2'],
            Metrics: {
              AmortizedCost: { Amount: '2.3081821243', Unit: 'USD' },
            },
          },
          {
            Keys: ['EBS:VolumeUsage.st1'],
            Metrics: {
              AmortizedCost: { Amount: '1.5', Unit: 'USD' },
            },
          },
        ],
      },
    ],
  }
}
