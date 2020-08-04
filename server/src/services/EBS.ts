import AWS from 'aws-sdk'
import StorageUsage from '@domain/StorageUsage'
import { AWS_POWER_USAGE_EFFECTIVENESS, AWS_REGIONS, HDDCOEFFICIENT, SSDCOEFFICIENT } from '@domain/constants'
import { StorageEstimator } from '@domain/StorageEstimator'
import CloudService from '@domain/CloudService'
import moment from 'moment'

class EbsStorageUsage implements StorageUsage {
  readonly sizeGb: number
  readonly timestamp: Date
  readonly diskType: DiskType
}

interface EbsFootprintEstimate {
  timestamp: Date
  co2e: number
  wattHours: number
}

enum DiskType {
  SSD = 'SSD',
  HDD = 'HDD',
}

export default class EBS implements CloudService {
  serviceName = 'ebs'
  readonly costExplorer: AWS.CostExplorer
  readonly ssdEstimator: StorageEstimator
  readonly hddEstimator: StorageEstimator

  constructor() {
    this.ssdEstimator = new StorageEstimator(SSDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    this.hddEstimator = new StorageEstimator(HDDCOEFFICIENT, AWS_POWER_USAGE_EFFECTIVENESS)
    this.costExplorer = new AWS.CostExplorer({
      region: AWS_REGIONS.US_EAST_1, //must be us-east-1 to work
    })
  }

  async getUsage(startDate: Date, endDate: Date): Promise<EbsStorageUsage[]> {
    const params = {
      TimePeriod: {
        Start: startDate.toISOString().substr(0, 10),
        End: endDate.toISOString().substr(0, 10),
      },
      Filter: {
        Dimensions: {
          Key: 'USAGE_TYPE',
          Values: ['EBS:VolumeUsage.gp2', 'EBS:VolumeUsage.sc1', 'EBS:VolumeUsage.st1', 'EBS:VolumeUsage.io1'],
        },
      },
      Granularity: 'DAILY',
      Metrics: [
        'UsageQuantity',
        /* more items */
      ],
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
      // NextPageToken: 'STRING_VALUE'
    }

    const response = await this.costExplorer.getCostAndUsage(params).promise()

    return response.ResultsByTime.map((result) => {
      const timestampString = result.TimePeriod.Start
      return result.Groups.map((group) => {
        const gbMonth = Number.parseFloat(group.Metrics.UsageQuantity.Amount)
        const sizeGb = this.estimateGigabyteUsage(gbMonth, timestampString)
        const diskType = this.getDiskType(group.Keys[0]) // Should be improved
        return {
          sizeGb,
          timestamp: new Date(timestampString),
          diskType: diskType,
        }
      })
    })
      .flat()
      .filter((storageUsage: StorageUsage) => storageUsage.sizeGb)
  }

  private getDiskType(awsGroupKey: string) {
    if (awsGroupKey.endsWith('VolumeUsage.gp2') || awsGroupKey.endsWith('VolumeUsage.io1')) return DiskType.SSD
    if (awsGroupKey.endsWith('VolumeUsage.st1') || awsGroupKey.endsWith('VolumeUsage.sc1')) return DiskType.HDD
  }

  async getEstimates(start: Date, end: Date, region: string): Promise<EbsFootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    const ssdUsage = usage.filter(({ diskType: diskType }) => DiskType.SSD === diskType)
    const hddUsage = usage.filter(({ diskType: diskType }) => DiskType.HDD === diskType)
    const footprintEstimates = [
      ...this.ssdEstimator.estimate(ssdUsage, region),
      ...this.hddEstimator.estimate(hddUsage, region),
    ]

    return Object.values(
      footprintEstimates.reduce((acc: { [key: string]: EbsFootprintEstimate }, estimate) => {
        if (!acc[estimate.timestamp.toISOString()]) {
          acc[estimate.timestamp.toISOString()] = estimate
          return acc
        }
        acc[estimate.timestamp.toISOString()].co2e += estimate.co2e
        acc[estimate.timestamp.toISOString()].wattHours += estimate.wattHours
        return acc
      }, {}),
    )
  }

  private estimateGigabyteUsage(sizeGbMonth: number, timestamp: string) {
    // This function converts an AWS EBS Gigabyte-Month pricing metric into a Gigabyte value for a single day.
    // We do this by getting the number of days in the month, then multiplying the Gigabyte-month value by this.
    // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
    return sizeGbMonth * moment(timestamp).daysInMonth()
  }
}
