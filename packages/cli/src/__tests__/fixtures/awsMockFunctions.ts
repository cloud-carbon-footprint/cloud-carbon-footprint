/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  ec2MockGetMetricDataResponse,
  elastiCacheMockGetMetricDataResponse,
  rdsMockComputeGetMetricDataResponse,
  s3MockGetMetricDataResponse,
} from './cloudwatch.fixtures'
import AWSMock from 'aws-sdk-mock'
import AWS, { CostExplorer } from 'aws-sdk'
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

  AWSMock.mock(
    'CloudWatch',
    'getMetricData',
    (
      params: AWS.CloudWatch.GetMetricDataOutput,
      callback: (a: Error, response: any) => any,
    ) => {
      callback(null, mockGetMetricDataFunction())
    },
  )
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

  AWSMock.mock(
    'CostExplorer',
    'getCostAndUsage',
    (
      params: AWS.CostExplorer.GetCostAndUsageRequest,
      callback: (a: Error, response: any) => any,
    ) => {
      callback(null, mockGetCostAndUsageFunction(params))
    },
  )
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

  AWSMock.mock(
    'CloudWatchLogs',
    'describeLogGroups',
    (
      params: AWS.CloudWatchLogs.DescribeLogGroupsRequest,
      callback: (a: Error, response: any) => any,
    ) => {
      callback(null, mockDescribeLogGroupsFunction())
    },
  )
}

function mockLambdaStartQuery(mockStartQueryResponse: { queryId: string }) {
  const mockStartQueryFunction = jest.fn()
  mockStartQueryFunction
    .mockResolvedValue(mockStartQueryResponse)
    .mockResolvedValue(mockStartQueryResponse)
  return AWSMock.mock('CloudWatchLogs', 'startQuery', mockStartQueryFunction)
}

function mockLambdaGetQueryResults(mockGetQueryResults: {
  results: { field: string; value: string }[][]
  status: string
}) {
  const mockGetQueryResultsFunction = jest.fn()
  mockGetQueryResultsFunction
    .mockReturnValueOnce(mockGetQueryResults)
    .mockReturnValueOnce(mockGetQueryResults)
  AWSMock.mock(
    'CloudWatchLogs',
    'getQueryResults',
    (
      params: AWS.CloudWatchLogs.GetQueryResultsRequest,
      callback: (a: Error, response: any) => any,
    ) => {
      callback(null, mockGetQueryResultsFunction())
    },
  )
}

export function mockAwsCostExplorerGetCostAndUsageResponse(
  response: CostExplorer.GetCostAndUsageResponse,
) {
  AWSMock.mock(
    'CostExplorer',
    'getCostAndUsage',
    (
      params: AWS.CostExplorer.GetCostAndUsageRequest,
      callback: (a: Error, response: any) => any,
    ) => {
      callback(null, response)
    },
  )
}
