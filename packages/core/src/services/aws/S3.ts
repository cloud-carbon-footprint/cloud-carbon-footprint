/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import StorageUsage from '@domain/StorageUsage'
import { HDDStorageService } from '@domain/StorageService'
import Cost from '@domain/Cost'
import { getCostFromCostExplorer } from '@services/aws/CostMapper'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

export default class S3 extends HDDStorageService {
  serviceName = 'S3'

  constructor(private readonly serviceWrapper: ServiceWrapper) {
    super()
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

    const responses = await this.serviceWrapper.getMetricDataResponses(params)
    const s3ResponseData = responses[0].MetricDataResults[0]

    return (
      s3ResponseData.Timestamps.map((timestampString, i) => {
        return {
          timestamp: new Date(timestampString),
          terabyteHours: (s3ResponseData.Values[i] / 1099511627776) * 24, // Convert bytes to terabyte hours
        }
      }).filter((r: StorageUsage) => r.terabyteHours && r.timestamp) || []
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

    return getCostFromCostExplorer(params, this.serviceWrapper)
  }
}
