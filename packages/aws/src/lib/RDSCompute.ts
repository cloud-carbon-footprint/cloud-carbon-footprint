/*
 * © 2021 Thoughtworks, Inc.
 */

import { CostExplorer } from 'aws-sdk'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import {
  ServiceWithCPUUtilization,
  ComputeUsage,
  Cost,
} from '@cloud-carbon-footprint/core'

import { getComputeUsage } from './ComputeUsageMapper'
import { RDS_INSTANCE_TYPES } from './AWSInstanceTypes'
import { ServiceWrapper } from './ServiceWrapper'
import { getCostFromCostExplorer } from './CostMapper'

export default class RDSComputeService extends ServiceWithCPUUtilization {
  serviceName = 'rds'

  constructor(private readonly serviceWrapper: ServiceWrapper) {
    super()
  }

  async getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<ComputeUsage[]> {
    const metricDataResponses = await this.getCpuUtilization(start, end)
    const costAndUsageResponses = await this.getTotalVCpusByDate(
      start.toISOString().substr(0, 10),
      end.toISOString().substr(0, 10),
      region,
    )
    return getComputeUsage(
      metricDataResponses,
      costAndUsageResponses,
      RDS_INSTANCE_TYPES,
    )
  }

  private async getCpuUtilization(start: Date, end: Date) {
    const params = {
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'cpuUtilizationWithEmptyValues',
          Expression:
            "SEARCH('{AWS/RDS} MetricName=\"CPUUtilization\"', 'Average', 3600)",
          ReturnData: false,
        },
        {
          Id: 'cpuUtilization',
          Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
        },
      ],
      ScanBy: 'TimestampAscending',
    }

    return await this.serviceWrapper.getMetricDataResponses(params)
  }

  private async getTotalVCpusByDate(
    startDate: string,
    endDate: string,
    region: string,
  ): Promise<CostExplorer.GetCostAndUsageResponse[]> {
    const params = {
      TimePeriod: {
        Start: startDate,
        End: endDate,
      },
      Filter: {
        And: [
          {
            Dimensions: {
              Key: 'REGION',
              Values: [region],
            },
          },
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['RDS: Running Hours'],
            },
          },
        ],
      },
      Granularity: 'DAILY',
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
      Metrics: ['UsageQuantity'],
    }

    return await this.serviceWrapper.getCostAndUsageResponses(params)
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    const params: GetCostAndUsageRequest = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          {
            Dimensions: {
              Key: 'REGION',
              Values: [region],
            },
          },
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['RDS: Running Hours'],
            },
          },
        ],
      },
      Granularity: 'DAILY',
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
      Metrics: ['AmortizedCost'],
    }

    return getCostFromCostExplorer(params, this.serviceWrapper)
  }
}
