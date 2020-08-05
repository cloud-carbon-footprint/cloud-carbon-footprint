import AWS from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'
import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import { AWS_REGIONS, CACHE_NODE_TYPES } from '@domain/constants'
import { getComputeUsage } from '@services/ComputeUsageMapper'

export default class ElastiCache extends ServiceWithCPUUtilization {
  serviceName = 'elasticache'
  readonly cloudWatch: AWS.CloudWatch
  readonly costExplorer: AWS.CostExplorer

  constructor() {
    super()
    this.cloudWatch = new AWS.CloudWatch()
    this.costExplorer = new AWS.CostExplorer({
      region: AWS_REGIONS.US_EAST_1,
    })
  }

  async getUsage(startDate: Date, endDate: Date): Promise<ComputeUsage[]> {
    const params = {
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

    const getMetricDataResponse = await this.cloudWatch.getMetricData(params).promise()
    const getCostAndUsageResponse = await this.getTotalVCpusByDate(
      startDate.toISOString().substr(0, 10),
      endDate.toISOString().substr(0, 10),
    )

    return getComputeUsage(getMetricDataResponse, getCostAndUsageResponse, CACHE_NODE_TYPES)
  }

  private async getTotalVCpusByDate(
    startDate: string,
    endDate: string,
  ): Promise<AWS.CostExplorer.GetCostAndUsageResponse> {
    const params = {
      TimePeriod: {
        Start: startDate,
        End: endDate,
      },
      Filter: {
        And: [
          { Dimensions: { Key: 'USAGE_TYPE_GROUP', Values: ['ElastiCache: Running Hours'] } },
          { Dimensions: { Key: 'REGION', Values: [AWS.config.region] } },
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

    return await this.costExplorer.getCostAndUsage(params).promise()
  }
}
