import AWS from 'aws-sdk'
import StorageUsage from '@domain/StorageUsage'
import { HDDStorageService } from '@domain/StorageService'
import { getMetricDataResponses } from './AWS'

export default class S3 extends HDDStorageService {
  serviceName = 's3'
  readonly cloudWatch: AWS.CloudWatch

  constructor() {
    super()
    this.cloudWatch = new AWS.CloudWatch()
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

    const responses = await getMetricDataResponses(params)
    const s3ResponseData = responses[0].MetricDataResults[0]

    return (
      s3ResponseData.Timestamps.map((timestampString, i) => {
        return {
          timestamp: new Date(timestampString),
          sizeGb: s3ResponseData.Values[i] / 1e9, // Convert bytes to Gigabytes
        }
      }).filter((r: StorageUsage) => r.sizeGb && r.timestamp) || []
    )
  }
}
