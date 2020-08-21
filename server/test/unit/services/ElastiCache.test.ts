import ElastiCache from '@services/ElastiCache'
import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CostExplorer } from 'aws-sdk'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('ElastiCache', () => {
  const startDate = '2020-07-10'
  const dayTwo = '2020-07-11'
  const endDate = '2020-07-12'

  const region = 'us-west-1'

  afterEach(() => {
    AWSMock.restore()
  })

  it('should return the usage of two hours of different days', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest(startDate, endDate))
        callback(null, {
          MetricDataResults: [
            {
              Id: 'cpuUtilization',
              Label: 'AWS/ElastiCache CPUUtilization',
              Timestamps: [new Date(startDate), new Date(dayTwo)],
              Values: [1.0456, 2.03242],
              StatusCode: 'Complete',
              Messages: [],
            },
          ],
        })
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest(startDate, endDate, region))

        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startDate,
                End: dayTwo,
              },
              Groups: [
                {
                  Keys: ['NodeUsage:cache.t3.medium'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: '2',
                    },
                  },
                },
              ],
            },
            {
              TimePeriod: {
                Start: dayTwo,
                End: endDate,
              },
              Groups: [
                {
                  Keys: ['NodeUsage:cache.t3.medium'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: '2',
                    },
                  },
                },
              ],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache()
    const usageByHour = await elasticacheService.getUsage(new Date(startDate), new Date(endDate), region)

    expect(usageByHour).toEqual([
      { cpuUtilizationAverage: 1.0456, numberOfvCpus: 4, timestamp: new Date(startDate) },
      { cpuUtilizationAverage: 2.03242, numberOfvCpus: 4, timestamp: new Date(dayTwo) },
    ])
  })

  it('should return empty list when no usage', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest(startDate, endDate))

        callback(null, {
          MetricDataResults: [
            {
              Id: 'cpuUtilization',
              Label: 'cpuUtilization',
              Timestamps: [],
              Values: [],
            },
          ],
        })
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest(startDate, endDate, region))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startDate,
                End: endDate,
              },
              Groups: [],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache()
    const usageByHour = await elasticacheService.getUsage(new Date(startDate), new Date(endDate), region)

    expect(usageByHour).toEqual([])
  })

  it('should return the usage when two different cache instances types were used', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest(startDate, endDate))

        callback(null, {
          MetricDataResults: [
            {
              Id: 'cpuUtilization',
              Label: 'cpuUtilization',
              Timestamps: [new Date(startDate)],
              Values: [50],
            },
          ],
        })
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest(startDate, endDate, region))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startDate,
                End: endDate,
              },
              Groups: [
                {
                  Keys: ['USE2-NodeUsage:cache.t3.medium'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: '3',
                    },
                  },
                },
                {
                  Keys: ['USE2-NodeUsage:cache.t2.micro'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: '2',
                    },
                  },
                },
              ],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache()
    const usageByHour = await elasticacheService.getUsage(new Date(startDate), new Date(endDate), region)

    expect(usageByHour).toEqual([{ cpuUtilizationAverage: 50, numberOfvCpus: 8, timestamp: new Date(startDate) }])
  })

  it('should return the usage when two different cache instances types in different hours were used', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest(startDate, endDate))
        callback(null, {
          MetricDataResults: [
            {
              Id: 'cpuUtilization',
              Label: 'cpuUtilization',
              Timestamps: [new Date(startDate + 'T22:00:00.000Z'), new Date(startDate + 'T22:06:00.000Z')],
              Values: [50, 70],
            },
          ],
        })
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest(startDate, endDate, region))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startDate,
                End: endDate,
              },
              Groups: [
                {
                  Keys: ['USE2-NodeUsage:cache.t3.medium'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: '2',
                    },
                  },
                },
                {
                  Keys: ['USE2-NodeUsage:cache.t2.micro'],
                  Metrics: {
                    UsageQuantity: {
                      Amount: '2',
                    },
                  },
                },
              ],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache()
    const usageByHour = await elasticacheService.getUsage(new Date(startDate), new Date(endDate), region)

    expect(usageByHour).toEqual([{ cpuUtilizationAverage: 60, numberOfvCpus: 6, timestamp: new Date(startDate) }])
  })
})

function cloudwatchRequest(start: string, end: string) {
  return {
    StartTime: new Date(start),
    EndTime: new Date(end),
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

function costExplorerRequest(startDate: string, endDate: string, region: string) {
  return {
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
    Filter: {
      And: [
        { Dimensions: { Key: 'USAGE_TYPE_GROUP', Values: ['ElastiCache: Running Hours'] } },
        { Dimensions: { Key: 'REGION', Values: [region] } },
      ],
    },
    Granularity: 'DAILY',
    GroupBy: [
      {
        Key: 'USAGE_TYPE',
        Type: 'DIMENSION',
      },
    ],
    Metrics: ['UsageQuantity'],
  }
}
