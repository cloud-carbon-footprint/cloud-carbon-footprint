import AWS from 'aws-sdk'
import StorageUsage from '@domain/StorageUsage'
import { AWS_POWER_USAGE_EFFECTIVENESS, AWS_REGIONS, SSDCOEFFICIENT } from '@domain/constants'
import { StorageEstimator } from '@domain/StorageEstimator'
import CloudService from '@domain/CloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import moment from 'moment'

export default class EBS implements CloudService {
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

    return response.ResultsByTime.map((result) => {
      const timestampString = result.TimePeriod.Start
      let sizeGb = 0
      if (result.Groups.length > 0) {
        const gbMonth = Number.parseFloat(
          result.Groups.find((group) => group.Keys[0].endsWith('.gp2')).Metrics.UsageQuantity.Amount,
        )
        sizeGb = this.estimateGigabyteUsage(gbMonth, timestampString)
      }

      return {
        sizeGb,
        timestamp: new Date(timestampString),
      }
    }).filter((storageUsage: StorageUsage) => storageUsage.sizeGb)
  }

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    return this.ssdEstimator.estimate(usage, region)
  }

  private estimateGigabyteUsage(sizeGbMonth: number, timestamp: string) {
    // This function converts an AWS EBS Gigabyte-Month pricing metric into a Gigabyte value for a single day.
    // We do this by getting the number of days in the month, then multiplying the Gigabyte-month value by this.
    // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
    return sizeGbMonth * moment(timestamp).daysInMonth()
  }
}
