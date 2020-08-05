import AWS from 'aws-sdk'
import { AWS_POWER_USAGE_EFFECTIVENESS, AWS_REGIONS, HDDCOEFFICIENT, SSDCOEFFICIENT } from '@domain/constants'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import ICloudService from '@domain/ICloudService'
import { StorageEstimator } from '@domain/StorageEstimator'
import { DiskType, getUsageFromCostExplorer, MutableFootprintEstimate, VolumeUsage } from '@services/StorageUsageMapper'

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

  async getEstimates(start: Date, end: Date, region: string): Promise<MutableFootprintEstimate[]> {
    const usage = await this.getUsage(start, end)
    const ssdUsage = usage.filter(({ diskType: diskType }) => DiskType.SSD === diskType)
    const hddUsage = usage.filter(({ diskType: diskType }) => DiskType.HDD === diskType)
    const footprintEstimates = [
      ...this.ssdEstimator.estimate(ssdUsage, region),
      ...this.hddEstimator.estimate(hddUsage, region),
    ]

    return Object.values(
      footprintEstimates.reduce((acc: { [key: string]: MutableFootprintEstimate }, estimate) => {
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

  async getUsage(startDate: Date, endDate: Date): Promise<VolumeUsage[]> {
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

    return await getUsageFromCostExplorer(params, this.getDiskType)
  }

  private getDiskType = (awsGroupKey: string) => {
    if (awsGroupKey.endsWith('GP2-Storage') || awsGroupKey.endsWith('IOPS-Storage')) return DiskType.SSD
    if (awsGroupKey.endsWith('Standard-Storage')) return DiskType.HDD
    console.warn('Unexpected Cost explorer Dimension Name: ' + awsGroupKey)
  }
}
