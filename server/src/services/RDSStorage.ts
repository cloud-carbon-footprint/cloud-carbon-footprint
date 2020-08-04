import AWS from 'aws-sdk'
import { AWS_REGIONS } from '@domain/constants'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import { SSDStorageService } from '@domain/StorageService'
import StorageUsage from '@domain/StorageUsage'
import moment from 'moment'

export default class RDSStorage extends SSDStorageService {
  readonly costExplorer: AWS.CostExplorer
  serviceName = 'rds-storage'

  constructor() {
    super()
    this.costExplorer = new AWS.CostExplorer({
      region: AWS_REGIONS.US_EAST_1, //must be us-east-1 to work
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
          { Dimensions: { Key: 'REGION', Values: [AWS.config.region] } },
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['RDS: Storage'],
            },
          },
        ],
      },
      Granularity: 'DAILY',
      Metrics: ['UsageQuantity'],
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
    }

    const response = await this.costExplorer.getCostAndUsage(params).promise()
    return response.ResultsByTime.map((result) => {
      const timestampString = result.TimePeriod.Start
      let sizeGb = 0
      if (result.Groups.length > 0) {
        const gbMonth = Number.parseFloat(
          result.Groups.find((group) => group.Keys[0].endsWith('GP2-Storage')).Metrics.UsageQuantity.Amount,
        )
        sizeGb = this.estimateGigabyteUsage(gbMonth, timestampString)
      }

      return {
        sizeGb,
        timestamp: new Date(timestampString),
      }
    }).filter((storageUsage: StorageUsage) => storageUsage.sizeGb)
  }

  private estimateGigabyteUsage(sizeGbMonth: number, timestamp: string) {
    // This function converts an AWS EBS Gigabyte-Month pricing metric into a Gigabyte value for a single day.
    // We do this by getting the number of days in the month, then multiplying the Gigabyte-month value by this.
    // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
    return sizeGbMonth * moment(timestamp).daysInMonth()
  }
}
