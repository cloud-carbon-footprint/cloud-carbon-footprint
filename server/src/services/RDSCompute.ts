import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import { CostExplorer } from 'aws-sdk'
import { getComputeUsage } from '@services/ComputeUsageMapper'
import { RDS_INSTANCE_TYPES } from '@services/AWSInstanceTypes'
import { getCostAndUsageResponses, getMetricDataResponses } from '@services/AWS'

export default class RDSComputeService extends ServiceWithCPUUtilization {
  serviceName = 'rds'

  constructor() {
    super()
  }

  async getUsage(start: Date, end: Date): Promise<ComputeUsage[]> {
    const metricDataResponses = await this.getVCPUs(start, end)
    const costAndUsageResponses = await this.getTotalVCpusByDate(
      start.toISOString().substr(0, 10),
      end.toISOString().substr(0, 10),
    )
    return getComputeUsage(metricDataResponses, costAndUsageResponses, RDS_INSTANCE_TYPES)
  }

  private async getVCPUs(start: Date, end: Date) {
    const params = {
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'cpuUtilizationWithEmptyValues',
          Expression: "SEARCH('{AWS/RDS} MetricName=\"CPUUtilization\"', 'Average', 3600)",
          ReturnData: false,
        },
        {
          Id: 'cpuUtilization',
          Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
        },
      ],
      ScanBy: 'TimestampAscending',
    }

    return await getMetricDataResponses(params)
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
          {
            Dimensions: {
              Key: 'REGION',
              Values: ['us-west-1'],
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

    return await getCostAndUsageResponses(params)
  }
}
