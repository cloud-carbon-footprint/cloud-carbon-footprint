/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatchLogs, CostExplorer, CloudWatch } from 'aws-sdk'
import Lambda from '@services/aws/Lambda'
import { estimateCo2 } from '@domain/FootprintEstimationConstants'
import { buildCostExplorerGetCostResponse } from '@builders'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

describe('Lambda', () => {
  beforeAll(() => {
    AWSMock.setSDKInstance(AWS)
  })

  afterEach(() => {
    AWSMock.restore()
    jest.restoreAllMocks()
    startQuerySpy.mockClear()
  })

  const startDate = '2020-08-09T00:00:00Z'
  const endDate = '2020-08-10T00:00:00Z'
  const dayThree = '2020-08-11T00:00:00Z'
  const region = 'us-west-1'
  const queryResponse = {
    queryId: '321db1cd-5790-47aa-a3ab-e5036ffdd16f',
  }
  const logGroup = generateLogGroups(1).map((groupName) => ({
    logGroupName: groupName,
  }))

  const getServiceWrapper = () => new ServiceWrapper(new CloudWatch(), new CloudWatchLogs(), new CostExplorer())

  it('gets Lambda usage for one function and one day', async () => {
    const logGroups = logGroup
    const results = {
      results: [
        [
          {
            field: 'Date',
            value: startDate,
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
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        wattHours: 0.12,
        co2e: estimateCo2(0.12, 'AWS', region),
      },
    ])
  })

  it('gets Lambda usage for one function and two days', async () => {
    const logGroups = logGroup
    const results = {
      results: [
        [
          {
            field: 'Date',
            value: startDate,
          },
          {
            field: 'Watts',
            value: '0.10',
          },
        ],
        [
          {
            field: 'Date',
            value: endDate,
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
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(new Date(startDate), new Date(dayThree), region)

    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        wattHours: 0.12,
        co2e: estimateCo2(0.12, 'AWS', region),
      },
      {
        timestamp: new Date(endDate),
        wattHours: 0.48,
        co2e: estimateCo2(0.48, 'AWS', region),
      },
    ])
  })

  it('gets results from 2 Lambda log group names', async () => {
    const logGroups = generateLogGroups(2).map((groupName) => ({
      logGroupName: groupName,
    }))
    const results = {
      results: [
        [
          {
            field: 'Date',
            value: startDate,
          },
          {
            field: 'Watts',
            value: '0.20',
          },
        ],
        [
          {
            field: 'Date',
            value: startDate,
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
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(new Date(startDate), new Date(endDate), region)

    expect(startQuerySpy).toHaveBeenCalledWith(
      {
        startTime: expect.anything(),
        endTime: expect.anything(),
        queryString: expect.anything(),
        logGroupNames: generateLogGroups(2),
      },
      expect.anything(),
    )

    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        wattHours: 0.24,
        co2e: estimateCo2(0.24, 'AWS', region),
      },
      {
        timestamp: new Date(startDate),
        wattHours: 0.276,
        co2e: estimateCo2(0.276, 'AWS', region),
      },
    ])
  })

  it('gets results from 21 Lambda log group names', async () => {
    const logGroups = generateLogGroups(21).map((groupName) => ({
      logGroupName: groupName,
    }))
    const results = {
      results: [
        [
          {
            field: 'Date',
            value: startDate,
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
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(new Date(startDate), new Date(endDate), region)

    expect(startQuerySpy).toHaveBeenNthCalledWith(
      1,
      {
        startTime: expect.anything(),
        endTime: expect.anything(),
        queryString: expect.anything(),
        logGroupNames: generateLogGroups(20),
      },
      expect.anything(),
    )

    expect(startQuerySpy).toHaveBeenNthCalledWith(
      2,
      {
        startTime: expect.anything(),
        endTime: expect.anything(),
        queryString: expect.anything(),
        logGroupNames: ['/aws/lambda/sample-function-name-21'],
      },
      expect.anything(),
    )
    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        wattHours: 0.276,
        co2e: estimateCo2(0.276, 'AWS', region),
      },
      {
        timestamp: new Date(startDate),
        wattHours: 0.276,
        co2e: estimateCo2(0.276, 'AWS', region),
      },
    ])
  })

  it('gets Lambda usage for one function and one day when there are no group names for that region', async () => {
    mockDescribeLogGroups([])

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(new Date(startDate), new Date(endDate), region)

    expect(result).toEqual([])
  })

  it('throws an error if status is not complete after 100 ms', async () => {
    const logGroups = logGroup
    const results = {
      results: [
        [
          {
            field: 'Date',
            value: startDate,
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
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(100, 50, getServiceWrapper())

    const expectedError = new Error('CloudWatchLog request failed, status: Running')

    try {
      await lambdaService.getEstimates(new Date(startDate), new Date(endDate), region)
    } catch (error) {
      expect(error).toEqual(expectedError)
    }
  })

  it('gets Lambda cost', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetCostResponse([
            { start: startDate, amount: 100.0, keys: ['AWS Lambda'] },
            { start: endDate, amount: 50.0, keys: ['test'] },
          ]),
        )
      },
    )

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const lambdaCosts = await lambdaService.getCosts(new Date(startDate), new Date(endDate), 'us-east-1')

    expect(lambdaCosts).toEqual([
      { amount: 100.0, currency: 'USD', timestamp: new Date(startDate) },
      { amount: 50.0, currency: 'USD', timestamp: new Date(endDate) },
    ])
  })

  function mockDescribeLogGroups(logGroups: { logGroupName: string }[]) {
    AWSMock.mock(
      'CloudWatchLogs',
      'describeLogGroups',
      (params: CloudWatchLogs.DescribeLogGroupsRequest, callback: (a: Error, response: any) => any) => {
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
      (params: CloudWatchLogs.GetQueryResultsRequest, callback: (a: Error, response: any) => any) => {
        callback(null, results)
      },
    )
  }
})

function generateLogGroups(numberOfLogGroups: number): string[] {
  return [...Array(numberOfLogGroups).keys()].map((i) => `/aws/lambda/sample-function-name-${i + 1}`)
}
