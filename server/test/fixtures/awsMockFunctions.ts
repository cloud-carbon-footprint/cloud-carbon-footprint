import {
  ec2MockGetMetricDataResponse,
  elastiCacheMockGetMetricDataResponse,
  rdsMockComputeGetMetricDataResponse,
  s3MockGetMetricDataResponse,
} from './cloudwatch.fixtures'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
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
import { mockGetQueryResults, mockLambdaLogGroups, mockStartQueryResponse } from './cloudwatchlogs.fixtures'

export function mockAwsCloudWatchGetMetricData() {
  const mockGetMetricDataFunction = jest.fn()
  mockGetMetricDataFunction
    .mockReturnValueOnce(s3MockGetMetricDataResponse)
    .mockReturnValueOnce(ec2MockGetMetricDataResponse)
    .mockReturnValueOnce(elastiCacheMockGetMetricDataResponse)
    .mockReturnValueOnce(rdsMockComputeGetMetricDataResponse)

  AWSMock.mock(
    'CloudWatch',
    'getMetricData',
    (params: AWS.CloudWatch.GetMetricDataOutput, callback: (a: Error, response: any) => any) => {
      callback(null, mockGetMetricDataFunction())
    },
  )
}

export function mockAwsCostExplorerGetCostAndUsage() {
  const mockGetCostAndUsageFunction = jest.fn()
  when(mockGetCostAndUsageFunction)
    .calledWith(expect.objectContaining({ Metrics: ['AmortizedCost'] }))
    .mockReturnValueOnce(ebsMockGetCostResponse)
    .mockReturnValueOnce(s3MockGetCostResponse)
    .mockReturnValueOnce(ec2MockGetCostResponse)
    .mockReturnValueOnce(elastiCacheMockGetCostResponse)
    .mockReturnValueOnce(rdsComputeMockGetCostResponse)
    .mockReturnValueOnce(rdsStorageMockGetCostResponse)

  when(mockGetCostAndUsageFunction)
    .calledWith(expect.objectContaining({ Metrics: ['UsageQuantity'] }))
    .mockReturnValueOnce(ebsMockGetUsageResponse)
    .mockReturnValueOnce(elastiCacheMockGetUsageResponse)
    .mockReturnValueOnce(rdsStorageMockGetUsageResponse)
    .mockReturnValueOnce(rdsComputeMockGetUsageResponse)

  AWSMock.mock(
    'CostExplorer',
    'getCostAndUsage',
    (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
      callback(null, mockGetCostAndUsageFunction(params))
    },
  )
}

export function mockAwsCloudWatchGetQueryResultsForLambda() {
  mockLambdaDescribeLogGroups(mockLambdaLogGroups)
  mockLambdaStartQuery(mockStartQueryResponse)
  mockLambdaGetQueryResults(mockGetQueryResults)
}

function mockLambdaDescribeLogGroups(mockLambdaLogGroups: { logGroupName: string }[]) {
  const mockDescribeLogGroupsFunction = jest.fn()
  mockDescribeLogGroupsFunction.mockReturnValueOnce({
    logGroups: mockLambdaLogGroups,
  })

  AWSMock.mock(
    'CloudWatchLogs',
    'describeLogGroups',
    (params: AWS.CloudWatchLogs.DescribeLogGroupsRequest, callback: (a: Error, response: any) => any) => {
      callback(null, mockDescribeLogGroupsFunction())
    },
  )
}

function mockLambdaStartQuery(mockStartQueryResponse: { queryId: string }) {
  const mockStartQueryFunction = jest.fn()
  mockStartQueryFunction.mockResolvedValue(mockStartQueryResponse)
  return AWSMock.mock('CloudWatchLogs', 'startQuery', mockStartQueryFunction)
}

function mockLambdaGetQueryResults(mockGetQueryResults: {
  results: { field: string; value: string }[][]
  status: string
}) {
  const mockGetQueryResultsFunction = jest.fn()
  mockGetQueryResultsFunction.mockReturnValueOnce(mockGetQueryResults)
  AWSMock.mock(
    'CloudWatchLogs',
    'getQueryResults',
    (params: AWS.CloudWatchLogs.GetQueryResultsRequest, callback: (a: Error, response: any) => any) => {
      callback(null, mockGetQueryResultsFunction())
    },
  )
}
