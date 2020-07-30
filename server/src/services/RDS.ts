import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import AWS from 'aws-sdk'
import { AWS_REGIONS, RDS_INSTANCE_TYPES } from '@domain/constants'
import { aggregateCPUUtilizationByDay } from '@services/RawComputeUsage'

export class RDSService extends ServiceWithCPUUtilization {
  serviceName: string
  readonly cloudWatch: AWS.CloudWatch
  readonly costExplorer: AWS.CostExplorer

  constructor() {
    super()
    this.cloudWatch = new AWS.CloudWatch()
    this.costExplorer = new AWS.CostExplorer({
      region: AWS_REGIONS.US_EAST_1,
    })
  }

  async getUsage(start: Date, end: Date): Promise<ComputeUsage[]> {
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

    const getMetricDataResponse = await this.cloudWatch.getMetricData(params).promise()
    const getCostAndUsageResponse = await this.getTotalVCpusByDate(
      start.toISOString().substr(0, 10),
      end.toISOString().substr(0, 10),
    )
    const dataGroupByTimestamp = aggregateCPUUtilizationByDay(
      getMetricDataResponse,
      getCostAndUsageResponse,
      RDS_INSTANCE_TYPES,
    )

    // Build result
    const estimationsByDay: { [timestamp: string]: ComputeUsage } = {}
    Object.values(dataGroupByTimestamp).forEach((a) => {
      const timestamp = new Date(a.timestamp)
      const date = timestamp.toISOString().substr(0, 10)

      estimationsByDay[date] = {
        timestamp: new Date(date),
        cpuUtilizationAverage: a.cpuUtilizationAvg,
        numberOfvCpus: a.vCPUCount,
      }
    })

    return Object.values(estimationsByDay)
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

    return await this.costExplorer.getCostAndUsage(params).promise()
  }
}
