import StorageUsage from '@domain/StorageUsage'
import { HDDStorageService } from '@domain/StorageService'
import { AWSDecorator } from './AWSDecorator'

export default class S3 extends HDDStorageService {
  serviceName = 's3'

  constructor() {
    super()
  }

  async getUsage(startDate: Date, endDate: Date, region: string): Promise<StorageUsage[]> {
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

    const responses = await new AWSDecorator(region).getMetricDataResponses(params)
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
