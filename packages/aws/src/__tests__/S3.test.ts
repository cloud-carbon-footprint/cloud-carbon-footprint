/*
 * © 2021 Thoughtworks, Inc.
 */

import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CloudWatchLogs, CostExplorer } from 'aws-sdk'
import S3 from '../lib/S3'
import { ServiceWrapper } from '../lib/ServiceWrapper'
import mockAWSCloudWatchGetMetricDataCall from '../lib/mockAWSCloudWatchGetMetricDataCall'
import { buildCostExplorerGetCostResponse } from './fixtures/builders'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('S3', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  const region = 'us-east-1'
  const start = '2020-08-01T00:00:00.000Z'
  const dayTwo = '2020-08-02T00:00:00.000Z'
  const dayThree = '2020-08-03T00:00:00.000Z'
  const end = '2020-08-04T00:00:00.000Z'
  const metricDataQueries = [
    {
      Id: 's3Size',
      Expression:
        'SUM(SEARCH(\'{AWS/S3,BucketName,StorageType} MetricName="BucketSizeBytes" StorageType="StandardStorage"\', \'Average\', 86400))',
    },
  ]
  const getServiceWrapper = () =>
    new ServiceWrapper(
      new CloudWatch(),
      new CloudWatchLogs(),
      new CostExplorer(),
    )

  it('gets S3 usage', async () => {
    const response: any = {
      MetricDataResults: [
        {
          Id: 's3Size',
          Label: 's3Size',
          Timestamps: [start, dayTwo, dayThree, end],
          Values: [2586032500, 3286032500, 7286032500, 4286032500],
          StatusCode: 'Complete',
          Messages: [],
        },
      ],
    }

    mockAWSCloudWatchGetMetricDataCall(
      new Date(start),
      new Date(end),
      response,
      metricDataQueries,
    )

    const s3Service = new S3(getServiceWrapper())
    const result = await s3Service.getUsage(new Date(start), new Date(end))
    expect(result).toEqual([
      {
        terabyteHours: 0.0564475885767024,
        timestamp: new Date(start),
      },
      {
        terabyteHours: 0.0717270995664876,
        timestamp: new Date(dayTwo),
      },
      {
        terabyteHours: 0.1590385909366887,
        timestamp: new Date(dayThree),
      },
      {
        terabyteHours: 0.09355497240903787,
        timestamp: new Date(end),
      },
    ])
  })

  it('gets S3 cost for two days', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (
        params: CostExplorer.GetCostAndUsageRequest,
        callback: (a: Error, response: any) => any,
      ) => {
        callback(
          null,
          buildCostExplorerGetCostResponse([
            { start, amount: 2.3, keys: ['Amazon Simple Storage Service'] },
            { start: dayTwo, amount: 4.6, keys: ['test'] },
          ]),
        )
      },
    )

    const s3Service = new S3(getServiceWrapper())
    const s3Costs = await s3Service.getCosts(
      new Date(start),
      new Date(end),
      region,
    )

    expect(s3Costs).toEqual([
      { amount: 2.3, currency: 'USD', timestamp: new Date(start) },
      { amount: 4.6, currency: 'USD', timestamp: new Date(dayTwo) },
    ])
  })

  it('throw Partial Data Error if partial data returned', async () => {
    const response: any = {
      MetricDataResults: [
        {
          Id: 's3Size',
          Label: 's3Size',
          Timestamps: [start, dayTwo, dayThree, end],
          Values: [2586032500, 3286032500, 7286032500, 4286032500],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 's3Size',
          Label: 's3Size',
          Timestamps: [start, dayTwo, dayThree, end],
          Values: [2586032500, 3286032500, 7286032500, 4286032500],
          StatusCode: 'PartialData',
          Messages: [],
        },
      ],
    }
    mockAWSCloudWatchGetMetricDataCall(
      new Date(start),
      new Date(end),
      response,
      metricDataQueries,
    )

    const s3Service = new S3(getServiceWrapper())
    const getS3Usage = async () =>
      await s3Service.getUsage(new Date(start), new Date(end))

    await expect(getS3Usage).rejects.toThrow('Partial Data Returned from AWS')
  })

  it('do not throw Partial Data Error if complete data is returned', async () => {
    const response: any = {
      MetricDataResults: [
        {
          Id: 's3Size',
          Label: 's3Size',
          Timestamps: [start, dayTwo, dayThree, end],
          Values: [2586032500, 3286032500, 7286032500, 4286032500],
          StatusCode: 'Complete',
          Messages: [],
        },
        {
          Id: 's3Size',
          Label: 's3Size',
          Timestamps: [start, dayTwo, dayThree, end],
          Values: [2586032500, 3286032500, 7286032500, 4286032500],
          StatusCode: 'Complete',
          Messages: [],
        },
      ],
    }
    mockAWSCloudWatchGetMetricDataCall(
      new Date(start),
      new Date(end),
      response,
      metricDataQueries,
    )

    const s3Service = new S3(getServiceWrapper())
    const getS3Usage = async () =>
      await s3Service.getUsage(new Date(start), new Date(end))

    await expect(getS3Usage).not.toThrow()
  })
})
