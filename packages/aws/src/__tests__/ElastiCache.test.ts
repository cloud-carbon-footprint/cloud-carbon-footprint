/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CostExplorer, CloudWatchLogs } from 'aws-sdk'
import ElastiCache from '../lib/ElastiCache'
import { ServiceWrapper } from '../lib/ServiceWrapper'
import mockAWSCloudWatchGetMetricDataCall from '../lib/mockAWSCloudWatchGetMetricDataCall'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('ElastiCache', () => {
  const startDate = '2020-07-10'
  const dayTwo = '2020-07-11'
  const endDate = '2020-07-12'

  const region = 'us-west-1'
  const metrics = [
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
  ]
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
    )

  afterEach(() => {
    AWSMock.restore()
  })

  it('should return the usage of two hours of different days', async () => {
    const response: any = {
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
    }

    mockAWSCloudWatchGetMetricDataCall(
      new Date(startDate),
      new Date(endDate),
      response,
      metrics,
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
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

    const elasticacheService = new ElastiCache(getServiceWrapper())
    const usageByHour = await elasticacheService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(usageByHour).toEqual([
      {
        cpuUtilizationAverage: 1.0456,
        numberOfvCpus: 4,
        timestamp: new Date(startDate),
        usesAverageCPUConstant: false,
      },
      {
        cpuUtilizationAverage: 2.03242,
        numberOfvCpus: 4,
        timestamp: new Date(dayTwo),
        usesAverageCPUConstant: false,
      },
    ])
  })

  it('should return empty list when no usage', async () => {
    const response: any = {
      MetricDataResults: [],
    }
    mockAWSCloudWatchGetMetricDataCall(
      new Date(startDate),
      new Date(endDate),
      response,
      metrics,
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        expect(params).toEqual(costExplorerRequest(startDate, endDate, region))
        callback(null, {
          ResultsByTime: [
            {
              TimePeriod: {
                Start: startDate,
                End: endDate,
              },
              Total: {
                UsageQuantity: {
                  Amount: 0,
                },
              },
              Groups: [],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache(getServiceWrapper())
    const usageByHour = await elasticacheService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(usageByHour).toEqual([])
  })

  it('uses the cpu utilization constant for missing cpu utilization data', async () => {
    const response: any = {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Label: 'cpuUtilization',
          Timestamps: [],
          Values: [],
          StatusCode: 'Complete',
        },
      ],
    }

    mockAWSCloudWatchGetMetricDataCall(
      new Date(startDate),
      new Date(endDate),
      response,
      metrics,
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
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
                      Amount: '1',
                    },
                  },
                },
              ],
            },
          ],
        })
      },
    )

    const elasticacheService = new ElastiCache(getServiceWrapper())
    const usageByHour = await elasticacheService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(usageByHour).toEqual([
      {
        cpuUtilizationAverage: 50,
        numberOfvCpus: 2,
        timestamp: new Date(startDate),
        usesAverageCPUConstant: true,
      },
    ])
  })

  it('should return the usage when two different cache instances types were used', async () => {
    const response: any = {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Label: 'cpuUtilization',
          Timestamps: [new Date(startDate)],
          Values: [50],
          StatusCode: 'Complete',
        },
      ],
    }

    mockAWSCloudWatchGetMetricDataCall(
      new Date(startDate),
      new Date(endDate),
      response,
      metrics,
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
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

    const elasticacheService = new ElastiCache(getServiceWrapper())
    const usageByHour = await elasticacheService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(usageByHour).toEqual([
      {
        cpuUtilizationAverage: 50,
        numberOfvCpus: 8,
        timestamp: new Date(startDate),
        usesAverageCPUConstant: false,
      },
    ])
  })

  it('should return the usage when two different cache instances types in different hours were used', async () => {
    const response: any = {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Label: 'cpuUtilization',
          Timestamps: [
            new Date(startDate + 'T22:00:00.000Z'),
            new Date(startDate + 'T22:06:00.000Z'),
          ],
          Values: [50, 70],
          StatusCode: 'Complete',
        },
      ],
    }
    mockAWSCloudWatchGetMetricDataCall(
      new Date(startDate),
      new Date(endDate),
      response,
      metrics,
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
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

    const elasticacheService = new ElastiCache(getServiceWrapper())
    const usageByHour = await elasticacheService.getUsage(
      new Date(startDate),
      new Date(endDate),
      region,
    )

    expect(usageByHour).toEqual([
      {
        cpuUtilizationAverage: 60,
        numberOfvCpus: 6,
        timestamp: new Date(startDate),
        usesAverageCPUConstant: false,
      },
    ])
  })

  it('should throw PartialData when AWS returns PartialData', async () => {
    const response: any = {
      MetricDataResults: [
        {
          Id: 'cpuUtilization',
          Label: 'cpuUtilization',
          Timestamps: [
            new Date(startDate + 'T22:00:00.000Z'),
            new Date(startDate + 'T22:06:00.000Z'),
          ],
          Values: [50, 70],
          StatusCode: 'PartialData',
        },
      ],
    }
    mockAWSCloudWatchGetMetricDataCall(
      new Date(startDate),
      new Date(endDate),
      response,
      metrics,
    )

    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
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

    const elasticacheService = new ElastiCache(getServiceWrapper())
    const getUsageByHour = async () =>
      await elasticacheService.getUsage(
        new Date(startDate),
        new Date(endDate),
        region,
      )

    await expect(getUsageByHour).rejects.toThrow(
      'Partial Data Returned from AWS',
    )
  })
})

function costExplorerRequest(
  startDate: string,
  endDate: string,
  region: string,
) {
  return {
    TimePeriod: {
      Start: startDate,
      End: endDate,
    },
    Filter: {
      And: [
        {
          Dimensions: {
            Key: 'USAGE_TYPE_GROUP',
            Values: ['ElastiCache: Running Hours'],
          },
        },
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
