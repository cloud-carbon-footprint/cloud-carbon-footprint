import ComputeUsage from '@domain/ComputeUsage'
import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import { getComputeUsage } from '@services/ComputeUsageMapper'
import { CACHE_NODE_TYPES } from '@services/AWSInstanceTypes'
import { AwsDecorator } from '@services/AwsDecorator'

export default class ElastiCache extends ServiceWithCPUUtilization {
  serviceName = 'elasticache'

  constructor() {
    super()
  }

  async getUsage(start: Date, end: Date, region: string): Promise<ComputeUsage[]> {
    const cloudWatchParams = {
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'cpuUtilizationWithEmptyValues',
          Expression: "SEARCH('{AWS/ElastiCache} MetricName=\"CPUUtilization\"', 'Average', 3600)",
          ReturnData: false,
        },
        {
          Id: 'cpuUtilization',
          Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
        },
      ],
      ScanBy: 'TimestampAscending',
    }

    const metricDataResponses = await new AwsDecorator(region).getMetricDataResponses(cloudWatchParams)

    const costExplorerParams = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          { Dimensions: { Key: 'USAGE_TYPE_GROUP', Values: ['ElastiCache: Running Hours'] } },
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
    const costAndUsageResponses = await new AwsDecorator(region).getCostAndUsageResponses(costExplorerParams)

    return await getComputeUsage(metricDataResponses, costAndUsageResponses, CACHE_NODE_TYPES)
  }
}
