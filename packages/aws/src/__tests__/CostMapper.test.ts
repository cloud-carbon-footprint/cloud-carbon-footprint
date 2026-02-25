/*
 * © 2021 Thoughtworks, Inc.
 */

import { mockClient } from 'aws-sdk-client-mock'

import { getCostFromCostExplorer } from '../lib/CostMapper'
import { AWS_REGIONS } from '../lib'
import { ServiceWrapper } from '../lib'
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
  GetCostAndUsageCommandOutput,
} from '@aws-sdk/client-cost-explorer'

const startDate = '2020-08-06'
const endDate = '2020-08-07'

const costExplorerMock = mockClient(CostExplorerClient)

describe('CostMapper', function () {
  it('calculates cost ', async () => {
    costExplorerMock.on(GetCostAndUsageCommand).resolves(buildResponseBody())

    const costs = await getCostFromCostExplorer(
      buildRequestParams(),
      new ServiceWrapper(
        undefined,
        undefined,
        new CostExplorerClient({ region: AWS_REGIONS.US_EAST_1 }),
        undefined,
      ),
    )

    expect(costs).toEqual([
      { amount: 2.3081821243, currency: 'USD', timestamp: new Date(startDate) },
      { amount: 1.5, currency: 'USD', timestamp: new Date(startDate) },
    ])
  })
})

function buildRequestParams(): GetCostAndUsageCommandInput {
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

function buildResponseBody(): GetCostAndUsageCommandOutput {
  return {
    $metadata: {},
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
