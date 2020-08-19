import ElastiCache from '@services/ElastiCache'
import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('ElastiCache', () => {
  const startString = '2020-07-10'
  const endString = '2020-07-11'
  const region = 'us-west-1'

  afterEach(() => {
    AWSMock.restore()
  })

  it('should return the usage of two hours of different days', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest('2020-07-19', '2020-07-21'))
        callback(null, {
          MetricDataResults: [
            {
              Id: 'cpuUtilization',
              Label: 'AWS/ElastiCache CPUUtilization',
              Timestamps: [new Date('2020-07-19T22:00:00.000Z'), new Date('2020-07-20T23:00:00.000Z')],
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
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest('2020-07-19', '2020-07-21', region))

        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: '2020-07-19',
                End: '2020-07-20',
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
                Start: '2020-07-20',
                End: '2020-07-21',
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
    const usageByHour = await elasticacheService.getUsage(new Date('2020-07-19'), new Date('2020-07-21'), region)

    expect(usageByHour).toEqual([
      { cpuUtilizationAverage: 1.0456, numberOfvCpus: 4, timestamp: new Date('2020-07-19') },
      { cpuUtilizationAverage: 2.03242, numberOfvCpus: 4, timestamp: new Date('2020-07-20') },
    ])
  })

  it('should return empty list when no usage', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest(startString, endString))

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
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest(startString, endString, region))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startString,
                End: endString,
              },
              Groups: [],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache()
    const usageByHour = await elasticacheService.getUsage(new Date(startString), new Date(endString), region)

    expect(usageByHour).toEqual([])
  })

  it('should return the usage when two different cache instances types were used', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest(startString, endString))

        callback(null, {
          MetricDataResults: [
            {
              Id: 'cpuUtilization',
              Label: 'cpuUtilization',
              Timestamps: [new Date('2020-07-10T22:00:00.000Z')],
              Values: [50],
            },
          ],
        })
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest(startString, endString, region))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startString,
                End: endString,
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
    const usageByHour = await elasticacheService.getUsage(new Date(startString), new Date(endString), region)

    expect(usageByHour).toEqual([{ cpuUtilizationAverage: 50, numberOfvCpus: 8, timestamp: new Date(startString) }])
  })

  it('should return the usage when two different cache instances types in different hours were used', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest(startString, endString))

        callback(null, {
          MetricDataResults: [
            {
              Id: 'cpuUtilization',
              Label: 'cpuUtilization',
              Timestamps: [new Date('2020-07-10T22:00:00.000Z'), new Date('2020-07-10T22:06:00.000Z')],
              Values: [50, 70],
            },
          ],
        })
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest(startString, endString, region))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startString,
                End: endString,
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
    const usageByHour = await elasticacheService.getUsage(new Date(startString), new Date(endString), region)

    expect(usageByHour).toEqual([{ cpuUtilizationAverage: 60, numberOfvCpus: 6, timestamp: new Date(startString) }])
  })
})

function cloudwatchRequest(startTimestamp: string, endTimestamp: string) {
  return {
    StartTime: new Date(startTimestamp),
    EndTime: new Date(endTimestamp),
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
