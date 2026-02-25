/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  ec2MockGetMetricDataResponse,
  elastiCacheMockGetMetricDataResponse,
  rdsMockComputeGetMetricDataResponse,
  s3MockGetMetricDataResponse,
} from './cloudwatch.fixtures'
import { mockClient } from 'aws-sdk-client-mock'
import { when } from 'jest-when'
import {
  ebsMockGetCostResponse,
  ebsMockGetUsageResponse,
  ec2MockGetCostResponse,
  elastiCacheMockGetCostResponse,
  elastiCacheMockGetUsageResponse,
  rdsComputeMockGetCostResponse,
  rdsComputeMockGetUsageResponse,
  rdsStorageMockGetCostResponse,
  rdsStorageMockGetUsageResponse,
  s3MockGetCostResponse,
} from './costexplorer.fixtures'
import {
  mockGetQueryResults,
  mockLambdaLogGroups,
  mockStartQueryResponse,
} from './cloudwatchlogs.fixtures'

import {
  CloudWatchClient,
  GetMetricDataCommand,
} from '@aws-sdk/client-cloudwatch'
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandOutput,
} from '@aws-sdk/client-cost-explorer'
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  GetQueryResultsCommand,
  StartQueryCommand,
} from '@aws-sdk/client-cloudwatch-logs'

const cloudWatchMock = mockClient(CloudWatchClient)
const costExplorerMock = mockClient(CostExplorerClient)
const cloudWatchLogsMock = mockClient(CloudWatchLogsClient)

export function mockAwsCloudWatchGetMetricData() {
  const mockGetMetricDataFunction = jest.fn()
  mockGetMetricDataFunction
    .mockReturnValueOnce(s3MockGetMetricDataResponse)
    .mockReturnValueOnce(ec2MockGetMetricDataResponse)
    .mockReturnValueOnce(elastiCacheMockGetMetricDataResponse)
    .mockReturnValueOnce(rdsMockComputeGetMetricDataResponse)
    .mockReturnValueOnce(s3MockGetMetricDataResponse)
    .mockReturnValueOnce(ec2MockGetMetricDataResponse)
    .mockReturnValueOnce(elastiCacheMockGetMetricDataResponse)
    .mockReturnValueOnce(rdsMockComputeGetMetricDataResponse)

  cloudWatchMock.on(GetMetricDataCommand).resolves(mockGetMetricDataFunction())
}

export function mockAwsCostExplorerGetCostAndUsage() {
  const mockGetCostAndUsageFunction = jest.fn()

  // COST
  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['AmortizedCost'],
        Filter: {
          And: expect.arrayContaining([
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
          ]),
        },
      }),
    )
    .mockReturnValueOnce(ebsMockGetCostResponse)
    .mockReturnValueOnce(ebsMockGetCostResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['AmortizedCost'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'SERVICE',
                Values: ['Amazon Simple Storage Service'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(s3MockGetCostResponse)
    .mockReturnValueOnce(s3MockGetCostResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['AmortizedCost'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'USAGE_TYPE_GROUP',
                Values: ['EC2: Running Hours'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(ec2MockGetCostResponse)
    .mockReturnValueOnce(ec2MockGetCostResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['AmortizedCost'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'USAGE_TYPE_GROUP',
                Values: ['ElastiCache: Running Hours'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(elastiCacheMockGetCostResponse)
    .mockReturnValueOnce(elastiCacheMockGetCostResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['AmortizedCost'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'USAGE_TYPE_GROUP',
                Values: ['RDS: Running Hours'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(rdsComputeMockGetCostResponse)
    .mockReturnValueOnce(rdsComputeMockGetCostResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['AmortizedCost'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'USAGE_TYPE_GROUP',
                Values: ['RDS: Storage'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(rdsStorageMockGetCostResponse)
    .mockReturnValueOnce(rdsStorageMockGetCostResponse)

  // USAGE
  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['UsageQuantity'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'USAGE_TYPE_GROUP',
                Values: ['RDS: Running Hours'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(rdsComputeMockGetUsageResponse)
    .mockReturnValueOnce(rdsComputeMockGetUsageResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['UsageQuantity'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'USAGE_TYPE_GROUP',
                Values: ['RDS: Storage'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(rdsStorageMockGetUsageResponse)
    .mockReturnValueOnce(rdsStorageMockGetUsageResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['UsageQuantity'],
        Filter: {
          And: expect.arrayContaining([
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
          ]),
        },
      }),
    )
    .mockReturnValueOnce(ebsMockGetUsageResponse)
    .mockReturnValueOnce(ebsMockGetUsageResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(
      expect.objectContaining({
        Metrics: ['UsageQuantity'],
        Filter: {
          And: expect.arrayContaining([
            {
              Dimensions: {
                Key: 'USAGE_TYPE_GROUP',
                Values: ['ElastiCache: Running Hours'],
              },
            },
          ]),
        },
      }),
    )
    .mockReturnValueOnce(elastiCacheMockGetUsageResponse)
    .mockReturnValueOnce(elastiCacheMockGetUsageResponse)

  costExplorerMock
    .on(GetCostAndUsageCommand)
    .resolves(mockGetCostAndUsageFunction())
}

export function mockAwsCloudWatchGetQueryResultsForLambda() {
  mockLambdaDescribeLogGroups(mockLambdaLogGroups)
  mockLambdaStartQuery(mockStartQueryResponse)
  mockLambdaGetQueryResults(mockGetQueryResults)
}

function mockLambdaDescribeLogGroups(
  mockLambdaLogGroups: { logGroupName: string }[],
) {
  const mockDescribeLogGroupsFunction = jest.fn()
  mockDescribeLogGroupsFunction
    .mockReturnValueOnce({ logGroups: mockLambdaLogGroups })
    .mockReturnValueOnce({
      logGroups: mockLambdaLogGroups,
    })

  cloudWatchLogsMock
    .on(DescribeLogGroupsCommand)
    .resolves(mockDescribeLogGroupsFunction())
}

function mockLambdaStartQuery(mockStartQueryResponse: { queryId: string }) {
  const mockStartQueryFunction = jest.fn()
  mockStartQueryFunction
    .mockResolvedValue(mockStartQueryResponse)
    .mockResolvedValue(mockStartQueryResponse)
  return cloudWatchLogsMock
    .on(StartQueryCommand)
    .callsFake(mockStartQueryFunction)
}

function mockLambdaGetQueryResults(mockGetQueryResults: {
  results: { field: string; value: string }[][]
  status: string
}) {
  const mockGetQueryResultsFunction = jest.fn()
  mockGetQueryResultsFunction
    .mockReturnValueOnce(mockGetQueryResults)
    .mockReturnValueOnce(mockGetQueryResults)
  cloudWatchLogsMock
    .on(GetQueryResultsCommand)
    .resolves(mockGetQueryResultsFunction())
}

export function mockAwsCostExplorerGetCostAndUsageResponse(
  response: GetCostAndUsageCommandOutput,
) {
  costExplorerMock.on(GetCostAndUsageCommand).resolves(response)
}
