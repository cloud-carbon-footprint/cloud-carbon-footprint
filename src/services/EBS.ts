import AWS from 'aws-sdk'
import StorageUsage from '@domain/StorageUsage'
import { SSDStorageService } from '@domain/StorageService'

export default class EBS extends SSDStorageService {
  serviceName = 'ebs'
  readonly costExplorer: AWS.CostExplorer

  constructor() {
    super()
    this.costExplorer = new AWS.CostExplorer({
      region: 'us-east-1', //must be us-east-1 to work
    })
  }

  async getUsage(startDate: Date, endDate: Date): Promise<StorageUsage[]> {
    const params = {
      TimePeriod: {
        Start: startDate.toISOString().substr(0, 10),
        End: endDate.toISOString().substr(0, 10),
      },
      Filter: {
        Dimensions: {
          Key: 'USAGE_TYPE',
          Values: ['EBS:VolumeUsage.gp2'],
        },
      },
      Granularity: 'DAILY',
      Metrics: [
        'UsageQuantity',
        /* more items */
      ],
      // NextPageToken: 'STRING_VALUE'
    }

    const response = await this.costExplorer.getCostAndUsage(params).promise()

    return (
      response.ResultsByTime?.map((result) => {
        const gbMonth = Number.parseFloat(result?.Total?.UsageQuantity?.Amount)
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
