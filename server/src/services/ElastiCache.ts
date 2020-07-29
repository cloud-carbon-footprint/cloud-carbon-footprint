import AWS, { CloudWatch } from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'
import ComputeService from '@domain/ComputeService'
import { AWS_REGIONS, CACHE_NODE_TYPES } from '@domain/constants'

interface RawComputeUsage {
  cpuUtilization?: number[]
  vCPUCount?: number
  timestamp?: Date
  cpuUtilizationAvg?: number
}

export default class ElastiCache extends ComputeService {
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

    const responseMetricData = await this.cloudWatch.getMetricData(params).promise()

    const dataGroupByTimestamp: { [key: string]: RawComputeUsage } = {}
    const metricDataResults = responseMetricData.MetricDataResults

    this.aggregateCPUUtilizationByDay(metricDataResults, dataGroupByTimestamp)
    this.calculateAverages(dataGroupByTimestamp)

    const vcpusByDate = await this.getTotalVCpusByDate(
      startDate.toISOString().substr(0, 10),
      endDate.toISOString().substr(0, 10),
    )

    // Build result and add vCpus
    const estimationsByDay: { [timestamp: string]: ComputeUsage } = {}
    Object.values(dataGroupByTimestamp).forEach((a) => {
      const timestamp = new Date(a.timestamp)
      const date = timestamp.toISOString().substr(0, 10)

      estimationsByDay[date] = {
        timestamp: new Date(date),
        cpuUtilizationAverage: a.cpuUtilizationAvg,
        numberOfvCpus: vcpusByDate[date],
      }
    })

    return Object.values(estimationsByDay)
  }

  private calculateAverages(dataGroupByTimestamp: { [p: string]: RawComputeUsage }) {
    Object.values(dataGroupByTimestamp).forEach((a) => {
      a.cpuUtilizationAvg =
        a.cpuUtilization.reduce((acc, a) => {
          return acc + a
        }, 0) / a.cpuUtilization.length
    })
  }

  private aggregateCPUUtilizationByDay(
    metricDataResults: CloudWatch.MetricDataResult[],
    dataGroupByTimestamp: { [p: string]: RawComputeUsage },
  ) {
    const cpuUtilizationData = metricDataResults.filter((a) => a.Id === 'cpuUtilization')
    cpuUtilizationData.forEach((allClustersCPUUtilization) => {
      allClustersCPUUtilization.Timestamps.forEach((timestamp, i) => {
        const key = new Date(timestamp).toISOString().substr(0, 10)
        if (!dataGroupByTimestamp[key])
          dataGroupByTimestamp[key] = {
            cpuUtilization: [allClustersCPUUtilization.Values[i]],
            timestamp: timestamp,
          }
        else dataGroupByTimestamp[key].cpuUtilization.push(allClustersCPUUtilization.Values[i])
      })
    })
  }

  private async getTotalVCpusByDate(startDate: string, endDate: string): Promise<{ [timestamp: string]: number }> {
    const params = {
      TimePeriod: {
        Start: startDate,
        End: endDate,
      },
      Filter: {
        Dimensions: {
          Key: 'USAGE_TYPE_GROUP',
          Values: ['ElastiCache: Running Hours'],
        },
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

    const vcpusByDate: { [timestamp: string]: number } = {}
    const response = await this.costExplorer.getCostAndUsage(params).promise()
    response.ResultsByTime.reduce((acc, result) => {
      acc[result.TimePeriod.Start] = result.Groups.reduce((sum, group) => {
        return sum + Number.parseInt(group.Metrics.UsageQuantity.Amount) * CACHE_NODE_TYPES[group.Keys[0].split(':')[1]]
      }, 0)
      return acc
    }, vcpusByDate)

    return vcpusByDate
  }
}
