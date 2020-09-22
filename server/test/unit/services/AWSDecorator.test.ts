import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CostExplorer } from 'aws-sdk'
import { AWSDecorator } from '@services/aws/AWSDecorator'
import { GetMetricDataInput } from 'aws-sdk/clients/cloudwatch'

const startDate = '2020-08-06'
const endDate = '2020-08-07'
const region = 'us-east-1'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('aws service helper', () => {
  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
  })

  it('followPages decorator should follow CostExplorer next pages', async () => {
    const costExplorerMockFunction = jest.fn()
    const firstPageResponse = buildAwsCostExplorerGetCostAndUsageResponse(
      [{ start: startDate, value: '1.2120679', types: ['EBS:VolumeUsage.gp2'] }],
      'tokenToNextPage',
    )
    const secondPageResponse = buildAwsCostExplorerGetCostAndUsageResponse(
      [{ start: startDate, value: '1.2120679', types: ['EBS:VolumeUsage.gp2'] }],
      null,
    )
    costExplorerMockFunction.mockReturnValueOnce(firstPageResponse).mockReturnValueOnce(secondPageResponse)

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (request: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(null, costExplorerMockFunction())
      },
    )
    const responses = await new AWSDecorator(region).getCostAndUsageResponses(
      buildAwsCostExplorerGetCostAndUsageRequest(),
    )

    expect(responses).toEqual([firstPageResponse, secondPageResponse])
  })

  it('followPages decorator should follow CloudWatch next pages', async () => {
    const cloudWatchMockFunction = jest.fn()
    const firstPageResponse = buildAwsCloudWatchGetMetricDataResponse('tokenToNextPage')
    const secondPageResponse = buildAwsCloudWatchGetMetricDataResponse(null)
    cloudWatchMockFunction.mockReturnValueOnce(firstPageResponse).mockReturnValueOnce(secondPageResponse)

    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (request: CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        callback(null, cloudWatchMockFunction())
      },
    )
    const responses = await new AWSDecorator(region).getMetricDataResponses(buildAwsCloudWatchGetMetricDataRequest())

    expect(responses).toEqual([firstPageResponse, secondPageResponse])
  })
})

function buildAwsCostExplorerGetCostAndUsageRequest() {
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

function buildAwsCloudWatchGetMetricDataResponse(nextPageToken: string): CloudWatch.GetMetricDataOutput {
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
        Expression: "SEARCH('{AWS/ElastiCache} MetricName=\"CPUUtilization\"', 'Average', 3600)",
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
