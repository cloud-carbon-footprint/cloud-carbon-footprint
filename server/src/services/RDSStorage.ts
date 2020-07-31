import AWS from 'aws-sdk'
import { AWS_REGIONS } from '@domain/constants'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import { SSDStorageService } from '@domain/StorageService'
import StorageUsage from '@domain/StorageUsage'
import moment from 'moment'

export class RDSStorage extends SSDStorageService {
  readonly costExplorer: AWS.CostExplorer
  serviceName = 'rds-storage'

  constructor(private region: string) {
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
          { Dimensions: { Key: 'REGION', Values: [this.region] } },
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
    }

    const response = await this.costExplorer.getCostAndUsage(params).promise()

    return response.ResultsByTime.map((result) => {
      const gbMonth = Number.parseFloat(
        result.Groups.find((group) => group.Keys[0].endsWith('GP2-Storage')).Metrics.UsageQuantity.Amount,
      )
      const timestampString = result.TimePeriod.Start
      const sizeGb = this.estimateGigabyteUsage(gbMonth, timestampString)

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
