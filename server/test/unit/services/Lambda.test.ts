import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import Lambda from '@services/Lambda'
import { estimateCo2 } from '@domain/FootprintEstimationConfig'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

function mockDescribeLogGroups(logGroups: { logGroupName: string }[]) {
  AWSMock.mock(
    'CloudWatchLogs',
    'describeLogGroups',
    (params: AWS.CloudWatchLogs.DescribeLogGroupsRequest, callback: (a: Error, response: any) => any) => {
      callback(null, {
        logGroups: logGroups,
      })
    },
  )
}

describe('Lambda', () => {
  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
  })

  it('gets Lambda usage for one function and one day', async () => {
    const logGroups = [
      {
        logGroupName: '/aws/lambda/sample-function-name',
      },
    ]

    mockDescribeLogGroups(logGroups)

    AWSMock.mock(
      'CloudWatchLogs',
      'startQuery',
      (params: AWS.CloudWatchLogs.StartQueryRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
        })
      },
    )

    AWSMock.mock(
      'CloudWatchLogs',
      'getQueryResults',
      (params: AWS.CloudWatchLogs.GetQueryResultsRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          results: [
            [
              {
                field: 'Date',
                value: '2020-08-09 00:00:00.000',
              },
              {
                field: 'Watts',
                value: '0.10',
              },
            ],
          ],
          status: 'Complete',
        })
      },
    )

    const lambdaService = new Lambda()
    const result = await lambdaService.getEstimates(
      new Date('2020-08-09T00:00:00Z'),
      new Date('2020-08-10T00:00:00Z'),
      'us-west-1',
    )

    expect(result).toEqual([
      {
        timestamp: new Date('2020-08-09T00:00:00Z'),
        wattHours: 0.1,
        co2e: estimateCo2(0.1, 'us-west-1'),
      },
    ])
  })

  it('gets Lambda usage for one function and two days', async () => {
    const logGroups = [
      {
        logGroupName: '/aws/lambda/sample-function-name',
      },
    ]
    mockDescribeLogGroups(logGroups)

    AWSMock.mock(
      'CloudWatchLogs',
      'startQuery',
      (params: AWS.CloudWatchLogs.StartQueryRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
        })
      },
    )

    AWSMock.mock(
      'CloudWatchLogs',
      'getQueryResults',
      (params: AWS.CloudWatchLogs.GetQueryResultsRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          results: [
            [
              {
                field: 'Date',
                value: '2020-08-09 00:00:00.000',
              },
              {
                field: 'Watts',
                value: '0.10',
              },
            ],
            [
              {
                field: 'Date',
                value: '2020-08-10 00:00:00.000',
              },
              {
                field: 'Watts',
                value: '0.40',
              },
            ],
          ],
          status: 'Complete',
        })
      },
    )

    const lambdaService = new Lambda()
    const result = await lambdaService.getEstimates(
      new Date('2020-08-09T00:00:00Z'),
      new Date('2020-08-11T00:00:00Z'),
      'us-west-1',
    )

    expect(result).toEqual([
      {
        timestamp: new Date('2020-08-09T00:00:00Z'),
        wattHours: 0.1,
        co2e: estimateCo2(0.1, 'us-west-1'),
      },
      {
        timestamp: new Date('2020-08-10T00:00:00Z'),
        wattHours: 0.4,
        co2e: estimateCo2(0.4, 'us-west-1'),
      },
    ])
  })

  it('gets results from 2 Lambda log group names', async () => {
    const logGroups = [
      {
        logGroupName: '/aws/lambda/sample-function-name',
      },
      {
        logGroupName: '/aws/lambda/sample-function-name-2',
      },
    ]
    mockDescribeLogGroups(logGroups)

    AWSMock.mock(
      'CloudWatchLogs',
      'startQuery',
      (params: AWS.CloudWatchLogs.StartQueryRequest, callback: (a: Error, response: any) => any) => {
        expect(params.logGroupNames).toEqual(['/aws/lambda/sample-function-name', '/aws/lambda/sample-function-name-2'])
        callback(null, {
          queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
        })
      },
    )

    AWSMock.mock(
      'CloudWatchLogs',
      'getQueryResults',
      (params: AWS.CloudWatchLogs.GetQueryResultsRequest, callback: (a: Error, response: any) => any) => {
        callback(null, {
          results: [
            [
              {
                field: 'Date',
                value: '2020-08-09 00:00:00.000',
              },
              {
                field: 'Watts',
                value: '0.20',
              },
            ],
          ],
          status: 'Complete',
        })
      },
    )

    const lambdaService = new Lambda()
    await lambdaService.getEstimates(new Date('2020-08-09T00:00:00Z'), new Date('2020-08-11T00:00:00Z'), 'us-west-1')
  })
})

//TODO: handle more logGroups and multiple dates
// handle different statuses
//TODO: add test for region - services should be called with the region set on the AWSMock - might need to create factories
//TODO: verify that max wattage is injected into the query
//verify the query - has watts and date
