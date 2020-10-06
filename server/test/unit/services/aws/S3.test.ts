import AWSMock from 'aws-sdk-mock'
import AWS, { CloudWatch, CostExplorer } from 'aws-sdk'

import S3 from '@services/aws/S3'
import { buildCostExplorerGetCostResponse } from '@builders'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

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

  it('gets S3 usage', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          StartTime: new Date(start),
          EndTime: new Date(end),
          MetricDataQueries: [
            {
              Id: 's3Size',
              Expression:
                'SUM(SEARCH(\'{AWS/S3,BucketName,StorageType} MetricName="BucketSizeBytes" StorageType="StandardStorage"\', \'Average\', 86400))',
            },
          ],
          ScanBy: 'TimestampAscending',
        })

        callback(null, {
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
        })
      },
    )

    const s3Service = new S3(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    const result = await s3Service.getUsage(new Date(start), new Date(end))
    expect(result).toEqual([
      {
        sizeGb: 2.5860325,
        timestamp: new Date(start),
      },
      {
        sizeGb: 3.2860325,
        timestamp: new Date(dayTwo),
      },
      {
        sizeGb: 7.2860325,
        timestamp: new Date(dayThree),
      },
      {
        sizeGb: 4.2860325,
        timestamp: new Date(end),
      },
    ])
  })

  it('gets S3 cost for two days', async () => {
    AWSMock.mock(
      'CostExplorer',
      'getCostAndUsage',
      (params: CostExplorer.GetCostAndUsageRequest, callback: (a: Error, response: any) => any) => {
        callback(
          null,
          buildCostExplorerGetCostResponse([
            { start, amount: 2.3, keys: ['Amazon Simple Storage Service'] },
            { start: dayTwo, amount: 4.6, keys: ['test'] },
          ]),
        )
      },
    )

    const s3Service = new S3(new ServiceWrapper(new CloudWatch(), new CostExplorer()))
    const s3Costs = await s3Service.getCosts(new Date(start), new Date(end), region)

    expect(s3Costs).toEqual([
      { amount: 2.3, currency: 'USD', timestamp: new Date(start) },
      { amount: 4.6, currency: 'USD', timestamp: new Date(dayTwo) },
    ])
  })
})
