import { config } from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'
import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import { getComputeUsage } from '@services/ComputeUsageMapper'
import { CACHE_NODE_TYPES } from '@services/AWSInstanceTypes'
import { AwsDecorator } from '@services/AwsDecorator'

export default class ElastiCache extends ServiceWithCPUUtilization {
  serviceName = 'elasticache'
  readonly aws: AwsDecorator

  constructor() {
    super()
    this.aws = new AwsDecorator()
  }

  async getUsage(startDate: Date, endDate: Date): Promise<ComputeUsage[]> {
    const cloudWatchParams = {
      StartTime: startDate,
      EndTime: endDate,
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

    const metricDataResponses = await this.aws.getMetricDataResponses(cloudWatchParams)

    const costExplorerParams = {
      TimePeriod: {
        Start: startDate.toISOString().substr(0, 10),
        End: endDate.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          { Dimensions: { Key: 'USAGE_TYPE_GROUP', Values: ['ElastiCache: Running Hours'] } },
          { Dimensions: { Key: 'REGION', Values: [config.region] } },
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
    const costAndUsageResponses = await this.aws.getCostAndUsageResponses(costExplorerParams)

    return getComputeUsage(metricDataResponses, costAndUsageResponses, CACHE_NODE_TYPES)
  }
}
