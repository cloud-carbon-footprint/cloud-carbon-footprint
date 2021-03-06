/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import ComputeUsage from '../../domain/ComputeUsage'
import ServiceWithCPUUtilization from '../../domain/ServiceWithCPUUtilization'
import { getComputeUsage } from './ComputeUsageMapper'
import { CACHE_NODE_TYPES } from './AWSInstanceTypes'
import { ServiceWrapper } from './ServiceWrapper'
import Cost from '../../domain/Cost'
import { getCostFromCostExplorer } from './CostMapper'

export default class ElastiCache extends ServiceWithCPUUtilization {
  serviceName = 'ElastiCache'

  constructor(private readonly serviceWrapper: ServiceWrapper) {
    super()
  }

  async getUsage(
    start: Date,
    end: Date,
    region: string,
  ): Promise<ComputeUsage[]> {
    const cloudWatchParams = {
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'cpuUtilizationWithEmptyValues',
          Expression:
            "SEARCH('{AWS/ElastiCache} MetricName=\"CPUUtilization\"', 'Average', 3600)",
          ReturnData: false,
        },
        {
          Id: 'cpuUtilization',
          Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
        },
      ],
      ScanBy: 'TimestampAscending',
    }

    const metricDataResponses = await this.serviceWrapper.getMetricDataResponses(
      cloudWatchParams,
    )

    const costExplorerParams = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['ElastiCache: Running Hours'],
            },
          },
          { Dimensions: { Key: 'REGION', Values: [region] } },
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
    const costAndUsageResponses = await this.serviceWrapper.getCostAndUsageResponses(
      costExplorerParams,
    )

    return getComputeUsage(
      metricDataResponses,
      costAndUsageResponses,
      CACHE_NODE_TYPES,
    )
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    const costExplorerParams = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['ElastiCache: Running Hours'],
            },
          },
          { Dimensions: { Key: 'REGION', Values: [region] } },
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

    return getCostFromCostExplorer(costExplorerParams, this.serviceWrapper)
  }
}
