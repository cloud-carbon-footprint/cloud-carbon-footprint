import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

import ElastiCache from '@services/ElastiCache'
import { elastiCacheMockResponse } from '@fixtures'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
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

function costExplorerRequest(startDate: string, endDate: string) {
  return {
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
    Filter: {
      Dimensions: {
        Key: 'USAGE_TYPE_GROUP',
        Values: ['ElastiCache: Running Hours'],
      },
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

describe('ElastiCache', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('should return the usage of two hours of different days', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest('2020-07-19T00:00:00.000Z', '2020-07-21T00:00:00.000Z'))
        callback(null, elastiCacheMockResponse)
      },
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: AWS.CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(costExplorerRequest('2020-07-19', '2020-07-21'))

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

    const usageByHour = await elasticacheService.getUsage(
      new Date('2020-07-19T00:00:00.000Z'),
      new Date('2020-07-21T00:00:00.000Z'),
    )

    expect(usageByHour).toEqual([
      { cpuUtilizationAverage: 1.0456, numberOfvCpus: 4, timestamp: new Date('2020-07-19T00:00:00.000Z') },
      { cpuUtilizationAverage: 2.03242, numberOfvCpus: 4, timestamp: new Date('2020-07-20T00:00:00.000Z') },
    ])
  })

  it('should return empty list when no usage', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest('2020-07-10T00:00:00.000Z', '2020-07-11T00:00:00.000Z'))

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
        expect(params).toEqual(costExplorerRequest('2020-07-10', '2020-07-11'))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: '2020-07-10',
                End: '2020-07-11',
              },
              Groups: [],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache()

    const usageByHour = await elasticacheService.getUsage(
      new Date('2020-07-10T00:00:00.000Z'),
      new Date('2020-07-11T00:00:00.000Z'),
    )

    expect(usageByHour).toEqual([])
  })

  it('should return the usage when two different cache instances types were used', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest('2020-07-10T00:00:00.000Z', '2020-07-11T00:00:00.000Z'))

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
        expect(params).toEqual(costExplorerRequest('2020-07-10', '2020-07-11'))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: '2020-07-10',
                End: '2020-07-11',
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

    const usageByHour = await elasticacheService.getUsage(
      new Date('2020-07-10T00:00:00.000Z'),
      new Date('2020-07-11T00:00:00.000Z'),
    )

    expect(usageByHour).toEqual([
      { cpuUtilizationAverage: 50, numberOfvCpus: 8, timestamp: new Date('2020-07-10T00:00:00.000Z') },
    ])
  })

  it('should return the usage when two different cache instances types in different hours were used', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest('2020-07-10T00:00:00.000Z', '2020-07-11T00:00:00.000Z'))

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
        expect(params).toEqual(costExplorerRequest('2020-07-10', '2020-07-11'))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: '2020-07-10',
                End: '2020-07-11',
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

    const usageByHour = await elasticacheService.getUsage(
      new Date('2020-07-10T00:00:00.000Z'),
      new Date('2020-07-11T00:00:00.000Z'),
    )

    expect(usageByHour).toEqual([
      { cpuUtilizationAverage: 60, numberOfvCpus: 6, timestamp: new Date('2020-07-10T00:00:00.000Z') },
    ])
  })

  it('should return the usage when two different cache instances types in different hours were used', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual(cloudwatchRequest('2020-07-10T00:00:00.000Z', '2020-07-11T00:00:00.000Z'))

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
        expect(params).toEqual(costExplorerRequest('2020-07-10', '2020-07-11'))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: '2020-07-10',
                End: '2020-07-11',
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

    const usageByHour = await elasticacheService.getUsage(
      new Date('2020-07-10T00:00:00.000Z'),
      new Date('2020-07-11T00:00:00.000Z'),
    )

    expect(usageByHour).toEqual([
      { cpuUtilizationAverage: 60, numberOfvCpus: 6, timestamp: new Date('2020-07-10T00:00:00.000Z') },
    ])
  })
})
