import AWS from 'aws-sdk'
import StorageUsage from '@domain/StorageUsage'
import { AWS_POWER_USAGE_EFFECTIVENESS, AWS_REGIONS, SSDCOEFFICIENT } from '@domain/constants'
import { StorageEstimator } from '@domain/StorageEstimator'
import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'

export default class EBS implements ICloudService {
  serviceName = 'ebs'
  readonly costExplorer: AWS.CostExplorer
  readonly ssdEstimator: StorageEstimator

  constructor() {
    this.ssdEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    this.costExplorer = new AWS.CostExplorer({
      region: AWS_REGIONS.US_EAST_1, //must be us-east-1 to work
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

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    return this.ssdEstimator.estimate(usage, region)
  }
}
