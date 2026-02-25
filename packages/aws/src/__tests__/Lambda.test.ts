/*
 * © 2021 Thoughtworks, Inc.
 */

import { mockClient } from 'aws-sdk-client-mock'
import { estimateCo2 } from '@cloud-carbon-footprint/core'
import Lambda from '../lib/Lambda'
import { ServiceWrapper } from '../lib'
import { buildCostExplorerGetCostResponse } from './fixtures/builders'
import { AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH } from '../domain'
import { S3Client } from '@aws-sdk/client-s3'
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
} from '@aws-sdk/client-cost-explorer'
import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  DescribeQueriesCommand,
  GetQueryResultsCommand,
  QueryInfo,
  QueryStatus,
  StartQueryCommand,
} from '@aws-sdk/client-cloudwatch-logs'
import { CloudWatchClient } from '@aws-sdk/client-cloudwatch'

const costExplorerMock = mockClient(CostExplorerClient)
const cloudWatchLogsMock = mockClient(CloudWatchLogsClient)
const cloudWatchMock = mockClient(CloudWatchClient)

describe('Lambda', () => {
  afterEach(() => {
    costExplorerMock.reset()
    cloudWatchLogsMock.reset()
    cloudWatchMock.reset()
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

  const runningQueries: QueryInfo[] = [
    {
      queryId: 'test',
      status: 'Running',
    },
  ]

  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatchClient(),
      new CloudWatchLogsClient(),
      new CostExplorerClient(),
      new S3Client(),
    )

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
      status: QueryStatus.Complete,
    }

    mockDescribeLogGroups(logGroups)
    mockDescribeQueries(runningQueries)
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    const expectedKilowattHours = 0.00011350000000000001
    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        kilowattHours: expectedKilowattHours,
        co2e: estimateCo2(
          expectedKilowattHours,
          region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        ),
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
      status: QueryStatus.Complete,
    }

    mockDescribeLogGroups(logGroups)
    mockDescribeQueries(runningQueries)
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(
      new Date(startDate),
      new Date(dayThree),
      region,
    )
    const expectedKilowattHoursOne = 0.00011350000000000001
    const expectedKilowattHoursTwo = 0.00045400000000000003
    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        kilowattHours: expectedKilowattHoursOne,
        co2e: estimateCo2(
          expectedKilowattHoursOne,
          region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        ),
      },
      {
        timestamp: new Date(endDate),
        kilowattHours: expectedKilowattHoursTwo,
        co2e: estimateCo2(
          expectedKilowattHoursTwo,
          region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        ),
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
      status: QueryStatus.Complete,
    }

    mockDescribeLogGroups(logGroups)
    mockDescribeQueries(runningQueries)
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(startQuerySpy).toHaveBeenCalledWith(
      {
        startTime: expect.anything(),
        endTime: expect.anything(),
        queryString: expect.anything(),
        logGroupNames: generateLogGroups(2),
      },
      expect.anything(),
    )

    const expectedKilowattHoursOne = 0.00022700000000000002
    const expectedKilowattHoursTwo = 0.00026105000000000003

    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        kilowattHours: expectedKilowattHoursOne,
        co2e: estimateCo2(
          expectedKilowattHoursOne,
          region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        ),
      },
      {
        timestamp: new Date(startDate),
        kilowattHours: expectedKilowattHoursTwo,
        co2e: estimateCo2(
          expectedKilowattHoursTwo,
          region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        ),
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
      status: QueryStatus.Complete,
    }

    mockDescribeLogGroups(logGroups)
    mockDescribeQueries(runningQueries)
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
    )

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
    const expectedKilowattHours = 0.00026105000000000003
    expect(result).toEqual([
      {
        timestamp: new Date(startDate),
        kilowattHours: expectedKilowattHours,
        co2e: estimateCo2(
          expectedKilowattHours,
          region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        ),
      },
      {
        timestamp: new Date(startDate),
        kilowattHours: expectedKilowattHours,
        co2e: estimateCo2(
          expectedKilowattHours,
          region,
          AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        ),
      },
    ])
  })

  it('gets Lambda usage for one function and one day when there are no group names for that region', async () => {
    mockDescribeLogGroups([])
    mockDescribeQueries([])

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const result = await lambdaService.getEstimates(
      new Date(startDate),
      new Date(endDate),
      region,
    )

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
      status: QueryStatus.Running,
    }

    mockDescribeLogGroups(logGroups)
    mockDescribeQueries(runningQueries)
    mockStartQuery(queryResponse)
    mockGetResults(results)

    const lambdaService = new Lambda(100, 50, getServiceWrapper())

    const expectedError = new Error(
      'CloudWatchLog request failed, status: Running',
    )

    try {
      await lambdaService.getEstimates(
        new Date(startDate),
        new Date(endDate),
        region,
      )
    } catch (error) {
      expect(error).toEqual(expectedError)
    }
  })

  it('gets Lambda cost', async () => {
    costExplorerMock.on(GetCostAndUsageCommand).resolves(
      buildCostExplorerGetCostResponse([
        { start: startDate, amount: 100.0, keys: ['AWS Lambda'] },
        { start: endDate, amount: 50.0, keys: ['test'] },
      ]),
    )

    const lambdaService = new Lambda(60000, 1000, getServiceWrapper())
    const lambdaCosts = await lambdaService.getCosts(
      new Date(startDate),
      new Date(endDate),
      'us-east-1',
    )

    expect(lambdaCosts).toEqual([
      { amount: 100.0, currency: 'USD', timestamp: new Date(startDate) },
      { amount: 50.0, currency: 'USD', timestamp: new Date(endDate) },
    ])
  })

  function mockDescribeLogGroups(logGroups: { logGroupName: string }[]) {
    cloudWatchLogsMock.on(DescribeLogGroupsCommand).resolves({
      logGroups: logGroups,
    })
  }

  function mockDescribeQueries(queries: QueryInfo[]) {
    cloudWatchLogsMock.on(DescribeQueriesCommand).resolves({
      queries: queries,
    })
  }

  const startQuerySpy = jest.fn()

  function mockStartQuery(response: { queryId: string }) {
    startQuerySpy.mockResolvedValue(response)
    return cloudWatchLogsMock.on(StartQueryCommand).callsFake(startQuerySpy)
  }

  function mockGetResults(results: {
    results: { field: string; value: string }[][]
    status: QueryStatus
  }) {
    cloudWatchLogsMock.on(GetQueryResultsCommand).resolves({
      $metadata: {},
      ...results,
    })
  }
})

function generateLogGroups(numberOfLogGroups: number): string[] {
  return [...Array(numberOfLogGroups).keys()].map(
    (i) => `/aws/lambda/sample-function-name-${i + 1}`,
  )
}
