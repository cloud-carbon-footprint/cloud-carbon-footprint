import AWS from 'aws-sdk'
import { AWS_REGIONS } from '@domain/constants'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import { SSDStorageService } from '@domain/StorageService'
import StorageUsage from '@domain/StorageUsage'

export class RDSStorage extends SSDStorageService {
  readonly costExplorer: AWS.CostExplorer
  serviceName = 'rds-storage'

  constructor() {
    super()
    this.costExplorer = new AWS.CostExplorer({
      region: AWS_REGIONS.US_EAST_1,
    })
  }

  async getUsage(startDate: Date, endDate: Date): Promise<StorageUsage[]> {
    const params: GetCostAndUsageRequest = {
      TimePeriod: {
        Start: startDate.toISOString().substr(0, 10),
        End: endDate.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          { Dimensions: { Key: 'REGION', Values: ['us-west-1'] } },
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['RDS: Storage'],
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
      Metrics: ['UsageQuantity'],
    }

    const response = await this.costExplorer.getCostAndUsage(params).promise()

    return (
      response.ResultsByTime?.map((result) => {
        const gbMonth = Number.parseFloat(result.Groups[0].Metrics.UsageQuantity.Amount)
        const sizeGb = this.estimateGigabyteUsage(gbMonth)
        const timestampString = result?.TimePeriod?.Start

        return {
          sizeGb,
          timestamp: new Date(timestampString),
        }
      }).filter((r: StorageUsage) => r.sizeGb && r.timestamp) || []
    )
  }

  private estimateGigabyteUsage(sizeGbMonth: number) {
    // This function converts an AWS EBS Gigabyte-Month pricing metric into a Gigabyte value for a single day.
    // We do this by assuming all months have 30 days, then multiplying the Gigabyte-month value by this.
    // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
    return sizeGbMonth * 30
  }
}
