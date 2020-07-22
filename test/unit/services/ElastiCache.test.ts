import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

import ElastiCache from '@services/ElastiCache'
import { elastiCacheMockResponse } from '@fixtures'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('ElastiCache', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('gets Elasticache usage', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          StartTime: new Date('2020-07-10T00:00:00.000Z'),
          EndTime: new Date('2020-07-21T00:00:00.000Z'),
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
        })

        callback(null, elastiCacheMockResponse)
      },
    )

    const elasticacheService = new ElastiCache()

    const result = await elasticacheService.getUsage(
      new Date('2020-07-10T00:00:00.000Z'),
      new Date('2020-07-21T00:00:00.000Z'),
    )

    expect(result).toEqual([
      { cpuUtilizationAverage: 1.0456, numberOfvCpus: 1, timestamp: new Date('2020-07-19T00:00:00.000Z') },
      { cpuUtilizationAverage: 2.03242, numberOfvCpus: 1, timestamp: new Date('2020-07-20T00:00:00.000Z') },
    ])
  })
})
