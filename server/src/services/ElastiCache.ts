import { CostExplorer, CloudWatch, config } from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'
import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import { getComputeUsage } from '@services/ComputeUsageMapper'
import { CACHE_NODE_TYPES } from '@services/AWSInstanceTypes'
import { getCostAndUsageResponses } from '@services/AWS'

export default class ElastiCache extends ServiceWithCPUUtilization {
  serviceName = 'elasticache'
  readonly cloudWatch: CloudWatch
  readonly costExplorer: CostExplorer

  constructor() {
    super()
    this.cloudWatch = new CloudWatch()
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
    const getCostAndUsageResponses = await this.getTotalVCpusByDate(
      startDate.toISOString().substr(0, 10),
      endDate.toISOString().substr(0, 10),
    )

    return getComputeUsage(getMetricDataResponse, getCostAndUsageResponses, CACHE_NODE_TYPES)
  }

  private async getTotalVCpusByDate(
    startDate: string,
    endDate: string,
  ): Promise<CostExplorer.GetCostAndUsageResponse[]> {
    const params = {
      TimePeriod: {
        Start: startDate,
        End: endDate,
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

    return await getCostAndUsageResponses(params)
  }
}
