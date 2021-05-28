/*
 * © 2021 ThoughtWorks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer, Athena } from 'aws-sdk'
import { GetMetricDataInput } from 'aws-sdk/clients/cloudwatch'
import { ServiceWrapper } from '../lib/ServiceWrapper'

const startDate = '2020-08-06'
const endDate = '2020-08-07'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('aws service helper', () => {
  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
  })

  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
      new Athena(),
    )

  it('enablePagination decorator should follow CostExplorer next pages', async () => {
    const costExplorerGetCostAndUsageSpy = jest.fn()
    const firstPageResponse = buildAwsCostExplorerGetCostAndUsageResponse(
      [
        {
          start: startDate,
          value: '1.2120679',
          types: ['EBS:VolumeUsage.gp2'],
        },
      ],
      'tokenToNextPage',
    )
    const secondPageResponse = buildAwsCostExplorerGetCostAndUsageResponse(
      [
        {
          start: startDate,
          value: '1.2120679',
          types: ['EBS:VolumeUsage.gp2'],
        },
      ],
      null,
    )
    const getCostAndUsageRequest = buildAwsCostExplorerGetCostAndUsageRequest()
    costExplorerGetCostAndUsageSpy
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse)

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      costExplorerGetCostAndUsageSpy,
    )
    const responses = await getServiceWrapper().getCostAndUsageResponses(
      getCostAndUsageRequest,
    )

    expect(costExplorerGetCostAndUsageSpy).toHaveBeenNthCalledWith(
      1,
      getCostAndUsageRequest,
      expect.anything(),
    )
    getCostAndUsageRequest.NextPageToken = 'tokenToNextPage'
    expect(costExplorerGetCostAndUsageSpy).toHaveBeenNthCalledWith(
      2,
      getCostAndUsageRequest,
      expect.anything(),
    )

    expect(responses).toEqual([firstPageResponse, secondPageResponse])
  })

  it('enablePagination decorator should follow CloudWatch next pages', async () => {
    const firstPageResponse =
      buildAwsCloudWatchGetMetricDataResponse('tokenToNextPage')
    const secondPageResponse = buildAwsCloudWatchGetMetricDataResponse(null)
    const metricDataRequest = buildAwsCloudWatchGetMetricDataRequest()

    const cloudWatchGetMetricDataSpy = jest.fn()
    cloudWatchGetMetricDataSpy
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse)

    AWSMock.mock('CloudWatch', 'getMetricData', cloudWatchGetMetricDataSpy)
    const responses = await getServiceWrapper().getMetricDataResponses(
      buildAwsCloudWatchGetMetricDataRequest(),
    )

    expect(cloudWatchGetMetricDataSpy).toHaveBeenNthCalledWith(
      1,
      metricDataRequest,
      expect.anything(),
    )
    metricDataRequest.NextToken = 'tokenToNextPage'
    expect(cloudWatchGetMetricDataSpy).toHaveBeenNthCalledWith(
      2,
      metricDataRequest,
      expect.anything(),
    )
    expect(responses).toEqual([firstPageResponse, secondPageResponse])
  })

  it('enablePagination decorator should follow Athena next pages', async () => {
    const firstPageResponse =
      buildAthenaGetQueryResultsResponse('tokenToNextPage')
    const secondPageResponse = buildAthenaGetQueryResultsResponse(null)

    const athenaGetResultsSpy = jest.fn()
    athenaGetResultsSpy
      .mockResolvedValueOnce(firstPageResponse)
      .mockResolvedValueOnce(secondPageResponse)
    AWSMock.mock('Athena', 'getQueryResults', athenaGetResultsSpy)

    const responses = await getServiceWrapper().getAthenaQueryResultSets({
      QueryExecutionId: 'some-query-id',
    })

    expect(athenaGetResultsSpy).toHaveBeenNthCalledWith(
      1,
      { QueryExecutionId: 'some-query-id' },
      expect.anything(),
    )
    expect(athenaGetResultsSpy).toHaveBeenNthCalledWith(
      2,
      {
        QueryExecutionId: 'some-query-id',
        NextToken: 'tokenToNextPage',
      },
      expect.anything(),
    )

    expect(responses).toEqual([firstPageResponse, secondPageResponse])
  })
})

function buildAwsCostExplorerGetCostAndUsageRequest(): CostExplorer.Types.GetCostAndUsageRequest {
  return {
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
    Granularity: 'DAILY',
    Metrics: [
      'AmortizedCost',
      'BlendedCost',
      'NetAmortizedCost',
      'NetUnblendedCost',
      'NormalizedUsageAmount',
      'UnblendedCost',
      'UsageQuantity',
    ],
    GroupBy: [
      {
        Key: 'USAGE_TYPE',
        Type: 'DIMENSION',
      },
    ],
  }
}

function buildAwsCostExplorerGetCostAndUsageResponse(
  data: { start: string; value: string; types: string[] }[],
  nextPageToken: string,
) {
  return {
    NextPageToken: nextPageToken,
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

function buildAwsCloudWatchGetMetricDataResponse(
  nextPageToken: string,
): CloudWatch.GetMetricDataOutput {
  return {
    NextToken: nextPageToken,
    MetricDataResults: [
      {
        Id: 'cpuUtilization',
        Label: 'AWS/ElastiCache CPUUtilization',
        Timestamps: [new Date(startDate), new Date(endDate)],
        Values: [1.0456, 2.03242],
        StatusCode: 'Complete',
        Messages: [],
      },
    ],
  }
}

function buildAwsCloudWatchGetMetricDataRequest(): GetMetricDataInput {
  return {
    StartTime: new Date(startDate),
    EndTime: new Date(endDate),
    MetricDataQueries: [
      {
        Id: 'cpuUtilizationWithEmptyValues',
        Expression:
          "SEARCH('{AWS/ElastiCache} MetricName=\"CPUUtilization\"', 'Average', 3600)",
        ReturnData: false,
      },
      {
        Id: 'cpuUtilization',
        Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
      },
    ],
    ScanBy: 'TimestampAscending',
  }
}

function buildAthenaGetQueryResultsResponse(
  nextPageToken: string,
): Athena.GetQueryResultsOutput {
  return {
    NextToken: nextPageToken,
    ResultSet: { Rows: [] },
  }
}
