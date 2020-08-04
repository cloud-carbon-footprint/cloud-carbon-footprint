import AWS from 'aws-sdk'
import { AWS_POWER_USAGE_EFFECTIVENESS, AWS_REGIONS, HDDCOEFFICIENT, SSDCOEFFICIENT } from '@domain/constants'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import { SSDStorageService } from '@domain/StorageService'
import StorageUsage from '@domain/StorageUsage'
import moment from 'moment'
import ICloudService from '@domain/ICloudService'
import { StorageEstimator } from '@domain/StorageEstimator'

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

export default class RDSStorage implements ICloudService {
  serviceName = 'rds-storage'
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

  async getUsage(startDate: Date, endDate: Date): Promise<EbsStorageUsage[]> {
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
    if (awsGroupKey.endsWith('GP2-Storage') || awsGroupKey.endsWith('IOPS-Storage')) return DiskType.SSD
    if (awsGroupKey.endsWith('Standard-Storage')) return DiskType.HDD
    console.warn('Unexpected Cost explorer Dimension Name: ' + awsGroupKey)
  }

  private estimateGigabyteUsage(sizeGbMonth: number, timestamp: string) {
    // This function converts an AWS EBS Gigabyte-Month pricing metric into a Gigabyte value for a single day.
    // We do this by getting the number of days in the month, then multiplying the Gigabyte-month value by this.
    // Source: https://aws.amazon.com/premiumsupport/knowledge-center/ebs-volume-charges/
    return sizeGbMonth * moment(timestamp).daysInMonth()
  }
}
