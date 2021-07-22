/*
 * © 2021 Thoughtworks, Inc.
 */

import { Logger } from '@cloud-carbon-footprint/common'
import {
  ICloudService,
  FootprintEstimate,
  Cost,
  CloudConstantsEmissionsFactors,
  CloudConstants,
} from '@cloud-carbon-footprint/core'
import {
  DiskType,
  getEstimatesFromCostExplorer,
  getUsageFromCostExplorer,
  VolumeUsage,
} from './StorageUsageMapper'
import { getCostFromCostExplorer } from './CostMapper'
import { ServiceWrapper } from './ServiceWrapper'

export default class EBS implements ICloudService {
  serviceName = 'EBS'
  ebsLogger: Logger

  constructor(private serviceWrapper: ServiceWrapper) {
    this.ebsLogger = new Logger('EBS')
  }

  async getEstimates(
    start: Date,
    end: Date,
    region: string,
    emissionsFactors: CloudConstantsEmissionsFactors,
    constants: CloudConstants,
  ): Promise<FootprintEstimate[]> {
    const usage: VolumeUsage[] = await this.getUsage(start, end, region)
    return getEstimatesFromCostExplorer(
      region,
      usage,
      emissionsFactors,
      constants,
    )
  }

  async getUsage(
    startDate: Date,
    endDate: Date,
    region: string,
  ): Promise<VolumeUsage[]> {
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

    return await getUsageFromCostExplorer(
      params,
      this.getDiskType,
      this.serviceWrapper,
    )
  }

  private getDiskType = (awsGroupKey: string) => {
    if (
      awsGroupKey.endsWith('VolumeUsage.gp2') ||
      awsGroupKey.endsWith('VolumeUsage.piops')
    )
      return DiskType.SSD
    if (
      awsGroupKey.endsWith('VolumeUsage.st1') ||
      awsGroupKey.endsWith('VolumeUsage.sc1') ||
      awsGroupKey.endsWith('VolumeUsage')
    )
      return DiskType.HDD
    this.ebsLogger.warn(
      'Unexpected Cost explorer Dimension Name: ' + awsGroupKey,
    )
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    const params = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
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
      Metrics: ['AmortizedCost'],
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
    }

    return await getCostFromCostExplorer(params, this.serviceWrapper)
  }
}
