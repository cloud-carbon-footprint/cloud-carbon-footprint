import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import { CostExplorer } from 'aws-sdk'
import { getComputeUsage } from '@services/ComputeUsageMapper'
import { RDS_INSTANCE_TYPES } from '@services/AWSInstanceTypes'
import { AWSDecorator } from '@services/AWSDecorator'
import Cost from '@domain/Cost'

export default class RDSComputeService extends ServiceWithCPUUtilization {
  serviceName = 'rds'

  constructor() {
    super()
  }

  async getUsage(start: Date, end: Date, region: string): Promise<ComputeUsage[]> {
    const metricDataResponses = await this.getVCPUs(start, end, region)
    const costAndUsageResponses = await this.getTotalVCpusByDate(
      start.toISOString().substr(0, 10),
      end.toISOString().substr(0, 10),
      region,
    )
    return getComputeUsage(metricDataResponses, costAndUsageResponses, RDS_INSTANCE_TYPES)
  }

  private async getVCPUs(start: Date, end: Date, region: string) {
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

    return await new AWSDecorator(region).getMetricDataResponses(params)
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

    return await new AWSDecorator(region).getCostAndUsageResponses(params)
  }

  async getCosts(/* start: Date, end: Date, region: string */): Promise<Cost[]> {
    return []
  }
}
