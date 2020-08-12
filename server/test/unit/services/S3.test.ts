import AWSMock from 'aws-sdk-mock'
import AWS from 'aws-sdk'

import S3 from '@services/S3'

beforeAll(() => {
  AWSMock.setSDKInstance(AWS)
})

describe('S3', () => {
  afterEach(() => {
    AWSMock.restore()
  })

  it('gets S3 usage', async () => {
    AWSMock.mock(
      'CloudWatch',
      'getMetricData',
      (params: AWS.CloudWatch.GetMetricDataInput, callback: (a: Error, response: any) => any) => {
        expect(params).toEqual({
          StartTime: new Date('2020-06-27T00:00:00.000Z'),
          EndTime: new Date('2020-06-30T00:00:00.000Z'),
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
              Timestamps: [
                '2020-06-27T00:00:00.000Z',
                '2020-06-28T00:00:00.000Z',
                '2020-06-29T00:00:00.000Z',
                '2020-06-30T00:00:00.000Z',
              ],
              Values: [2586032500, 3286032500, 7286032500, 4286032500],
              StatusCode: 'Complete',
              Messages: [],
            },
          ],
        })
      },
    )

    const s3Service = new S3()

    const result = await s3Service.getUsage(
      new Date('2020-06-27T00:00:00Z'),
      new Date('2020-06-30T00:00:00Z'),
      'us-east-1',
    )

    expect(result).toEqual([
      {
        sizeGb: 2.5860325,
        timestamp: new Date('2020-06-27T00:00:00Z'),
      },
      {
        sizeGb: 3.2860325,
        timestamp: new Date('2020-06-28T00:00:00Z'),
      },
      {
        sizeGb: 7.2860325,
        timestamp: new Date('2020-06-29T00:00:00Z'),
      },
      {
        sizeGb: 4.2860325,
        timestamp: new Date('2020-06-30T00:00:00Z'),
      },
    ])
  })
})
