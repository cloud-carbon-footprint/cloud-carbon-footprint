import StorageUsage from '@domain/StorageUsage'
import { HDDStorageService } from '@domain/StorageService'
import { AWSDecorator } from './AWSDecorator'
import Cost from '@domain/Cost'
import { getCostFromCostExplorer } from '@services/CostMapper'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'

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

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    // This request includes all s3 types/keys combined together
    const params: GetCostAndUsageRequest = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          { Dimensions: { Key: 'REGION', Values: [region] } },
          {
            Dimensions: {
              Key: 'SERVICE',
              Values: ['Amazon Simple Storage Service'],
            },
          },
        ],
      },
      Granularity: 'DAILY',
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
      Metrics: ['AmortizedCost'],
    }

    return getCostFromCostExplorer(params, region)
  }
}
