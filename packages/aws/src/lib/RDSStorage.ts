/*
 * © 2021 Thoughtworks, Inc.
 */

import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
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

export default class RDSStorage implements ICloudService {
  serviceName = 'rds-storage'
  rdsStorageLogger: Logger

  constructor(private readonly serviceWrapper: ServiceWrapper) {
    this.rdsStorageLogger = new Logger('RDS Storage Logger')
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

    return await getUsageFromCostExplorer(
      params,
      this.getDiskType,
      this.serviceWrapper,
    )
  }

  private getDiskType = (awsGroupKey: string) => {
    if (
      awsGroupKey.endsWith('GP2-Storage') ||
      awsGroupKey.endsWith('PIOPS-Storage')
    )
      return DiskType.SSD
    if (
      awsGroupKey.endsWith('StorageUsage') ||
      awsGroupKey.endsWith('ChargedBackupUsage')
    )
      return DiskType.HDD
    this.rdsStorageLogger.warn(
      'Unexpected Cost explorer Dimension Name: ' + awsGroupKey,
    )
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
