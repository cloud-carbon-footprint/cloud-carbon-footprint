import AWS from 'aws-sdk'
import StorageUsage from '@domain/StorageUsage'
import { HDDStorageService } from '@domain/StorageService'

export default class S3 extends HDDStorageService {
  serviceName = 's3'
  readonly cloudWatch: AWS.CloudWatch

  constructor() {
    super()
    this.cloudWatch = new AWS.CloudWatch({
      region: 'us-east-1',
    })
  }

  async getUsage(startDate: Date, endDate: Date): Promise<StorageUsage[]> {
    const params = {
      StartTime: startDate,
      EndTime: endDate,
      MetricDataQueries: [
        {
          Id: 's3Size',
          Expression:
            'SUM(SEARCH(\'{AWS/S3,BucketName,StorageType} MetricName="BucketSizeBytes" StorageType="StandardStorage"\', \'Average\', 86400))',
        },
      ],
      ScanBy: 'TimestampAscending',
    }

    const response = await this.cloudWatch.getMetricData(params).promise()
    const s3ResponseData = response.MetricDataResults[0]

    return (
      s3ResponseData.Timestamps.map((timestampString, i) => {
        return {
          timestamp: new Date(timestampString),
          sizeGb: s3ResponseData.Values[i] / 1e9,
        }
      }).filter((r: StorageUsage) => r.sizeGb && r.timestamp) || []
    )
  }
}
