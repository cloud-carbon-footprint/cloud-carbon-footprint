import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import ICloudService from '@domain/ICloudService'
import {
  DiskType,
  getEstimatesFromCostExplorer,
  getUsageFromCostExplorer,
  VolumeUsage,
} from '@services/StorageUsageMapper'
import FootprintEstimate from '@domain/FootprintEstimate'

export default class RDSStorage implements ICloudService {
  serviceName = 'rds-storage'

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const usage: VolumeUsage[] = await this.getUsage(start, end, region)
    return getEstimatesFromCostExplorer(start, end, region, usage)
  }

  async getUsage(startDate: Date, endDate: Date, region: string): Promise<VolumeUsage[]> {
    const params: GetCostAndUsageRequest = {
      TimePeriod: {
        Start: startDate.toISOString().substr(0, 10),
        End: endDate.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          { Dimensions: { Key: 'REGION', Values: [region] } },
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

    return await getUsageFromCostExplorer(params, this.getDiskType, region)
  }

  private getDiskType = (awsGroupKey: string) => {
    if (awsGroupKey.endsWith('GP2-Storage') || awsGroupKey.endsWith('PIOPS-Storage')) return DiskType.SSD
    if (awsGroupKey.endsWith('StorageUsage')) return DiskType.HDD
    console.warn('Unexpected Cost explorer Dimension Name: ' + awsGroupKey)
  }
}
