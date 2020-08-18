import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'
import Lambda from '@services/Lambda'
import { estimateCo2 } from '@domain/FootprintEstimationConstants'

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

const startQuerySpy = jest.fn()

function mockStartQuery(response: { queryId: string }) {
  startQuerySpy.mockResolvedValue(response)
  return AWSMock.mock('CloudWatchLogs', 'startQuery', startQuerySpy)
}

function mockGetResults(results: { results: { field: string; value: string }[][]; status: string }) {
  AWSMock.mock(
    'CloudWatchLogs',
    'getQueryResults',
    (params: AWS.CloudWatchLogs.GetQueryResultsRequest, callback: (a: Error, response: any) => any) => {
      callback(null, results)
    },
  )
}

describe('Lambda', () => {
  beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
    jest.mock('@domain/FootprintEstimationConstants', () => {
      WATT_HOURS: 2.35
    })
  })

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
    startQuerySpy.mockClear()
  })

  it('gets Lambda usage for one function and one day', async () => {
    const logGroups = [
      {
        logGroupName: '/aws/lambda/sample-function-name',
      },
    ]
    const response = {
      queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
    }
    const results = {
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
    }

    mockDescribeLogGroups(logGroups)
    mockStartQuery(response)
    mockGetResults(results)

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
    const response = {
      queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
    }
    const results = {
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
    }

    mockDescribeLogGroups(logGroups)
    mockStartQuery(response)
    mockGetResults(results)

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
    const response = {
      queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
    }
    const results = {
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
        [
          {
            field: 'Date',
            value: '2020-08-09 00:00:00.000',
          },
          {
            field: 'Watts',
            value: '0.23',
          },
        ],
      ],
      status: 'Complete',
    }

    mockDescribeLogGroups(logGroups)
    mockStartQuery(response)
    mockGetResults(results)

    const lambdaService = new Lambda()
    const result = await lambdaService.getEstimates(
      new Date('2020-08-09T00:00:00Z'),
      new Date('2020-08-10T00:00:00Z'),
      'us-west-1',
    )

    expect(startQuerySpy).toHaveBeenCalledWith(
      {
        startTime: expect.anything(),
        endTime: expect.anything(),
        queryString: expect.anything(),
        logGroupNames: ['/aws/lambda/sample-function-name', '/aws/lambda/sample-function-name-2'],
      },
      expect.anything(),
    )

    expect(result).toEqual([
      {
        timestamp: new Date('2020-08-09T00:00:00Z'),
        wattHours: 0.2,
        co2e: estimateCo2(0.2, 'us-west-1'),
      },
      {
        timestamp: new Date('2020-08-09T00:00:00Z'),
        wattHours: 0.23,
        co2e: estimateCo2(0.23, 'us-west-1'),
      },
    ])
  })

  it('gets Lambda usage for one function and one day when there are no group names for that region', async () => {
    mockDescribeLogGroups([])

    const lambdaService = new Lambda()
    const result = await lambdaService.getEstimates(
      new Date('2020-08-09T00:00:00Z'),
      new Date('2020-08-10T00:00:00Z'),
      'us-west-1',
    )

    expect(result).toEqual([
      {
        timestamp: new Date('2020-08-09T00:00:00Z'),
        wattHours: 0.0,
        co2e: 0.0,
      },
    ])
  })

  it('throws an error if status is not complete after 100 ms', async () => {
    const logGroups = [
      {
        logGroupName: '/aws/lambda/sample-function-name',
      },
    ]
    const response = {
      queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
    }
    const results = {
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
      status: 'Running',
    }

    mockDescribeLogGroups(logGroups)
    mockStartQuery(response)
    mockGetResults(results)

    const lambdaService = new Lambda(100, 50)

    const expectedError = new Error('CloudWatchLog request failed, status: Running')

    try {
      await lambdaService.getEstimates(new Date('2020-08-09T00:00:00Z'), new Date('2020-08-10T00:00:00Z'), 'us-west-1')
    } catch (error) {
      expect(error).toEqual(expectedError)
    }
  })
})
