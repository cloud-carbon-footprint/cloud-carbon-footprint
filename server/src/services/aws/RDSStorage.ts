import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import ICloudService from '@domain/ICloudService'
import {
  DiskType,
  getEstimatesFromCostExplorer,
  getUsageFromCostExplorer,
  VolumeUsage,
} from '@services/aws/StorageUsageMapper'
import FootprintEstimate from '@domain/FootprintEstimate'
import Cost from '@domain/Cost'
import { getCostFromCostExplorer } from '@services/aws/CostMapper'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

export default class RDSStorage implements ICloudService {
  serviceName = 'rds-storage'

  constructor(private readonly serviceWrapper: ServiceWrapper) {}

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

    return await getUsageFromCostExplorer(params, this.getDiskType, this.serviceWrapper)
  }

  private getDiskType = (awsGroupKey: string) => {
    if (awsGroupKey.endsWith('GP2-Storage') || awsGroupKey.endsWith('PIOPS-Storage')) return DiskType.SSD
    if (awsGroupKey.endsWith('StorageUsage')) return DiskType.HDD
    console.warn('Unexpected Cost explorer Dimension Name: ' + awsGroupKey)
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    const params: GetCostAndUsageRequest = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
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
      Metrics: ['AmortizedCost'],
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
    }

    return getCostFromCostExplorer(params, this.serviceWrapper)
  }
}
