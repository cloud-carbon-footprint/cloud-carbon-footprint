import ICloudService from '@domain/ICloudService'
import {
  DiskType,
  getEstimatesFromCostExplorer,
  getUsageFromCostExplorer,
  VolumeUsage,
} from '@services/StorageUsageMapper'
import FootprintEstimate from '@domain/FootprintEstimate'

export default class EBS implements ICloudService {
  serviceName = 'ebs'

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const usage: VolumeUsage[] = await this.getUsage(start, end, region)
    return getEstimatesFromCostExplorer(start, end, region, usage)
  }

  async getUsage(startDate: Date, endDate: Date, region: string): Promise<VolumeUsage[]> {
    const params = {
      TimePeriod: {
        Start: startDate.toISOString().substr(0, 10),
        End: endDate.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: [
                'EC2: EBS - SSD(gp2)',
                'EC2: EBS - SSD(io1)',
                'EC2: EBS - HDD(sc1)',
                'EC2: EBS - HDD(st1)',
                'EC2: EBS - Magnetic',
              ],
            },
          },
          { Dimensions: { Key: 'REGION', Values: [region] } },
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
    if (awsGroupKey.endsWith('VolumeUsage.gp2') || awsGroupKey.endsWith('VolumeUsage.piops')) return DiskType.SSD
    if (
      awsGroupKey.endsWith('VolumeUsage.st1') ||
      awsGroupKey.endsWith('VolumeUsage.sc1') ||
      awsGroupKey.endsWith('VolumeUsage')
    )
      return DiskType.HDD
    console.warn('Unexpected Cost explorer Dimension Name: ' + awsGroupKey)
  }
}
