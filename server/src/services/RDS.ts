import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import UsageData from '@domain/UsageData'
import AWS, { CloudWatch } from 'aws-sdk'
import { AWS_REGIONS, CACHE_NODE_TYPES } from '@domain/constants'

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

    const responseMetricData = await this.cloudWatch.getMetricData(params).promise()
    const metricDataResults = responseMetricData.MetricDataResults

    const dataGroupByTimestamp: { [key: string]: RawComputeUsage } = {}
    this.aggregateCPUUtilizationByDay(metricDataResults, dataGroupByTimestamp)
    this.calculateAverages(dataGroupByTimestamp)

    const vcpusByDate = await this.getTotalVCpusByDate(
      start.toISOString().substr(0, 10),
      end.toISOString().substr(0, 10),
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

  private calculateAverages(dataGroupByTimestamp: { [p: string]: RawComputeUsage }) {
    Object.values(dataGroupByTimestamp).forEach((a) => {
      a.cpuUtilizationAvg =
        a.cpuUtilization.reduce((acc, a) => {
          return acc + a
        }, 0) / a.cpuUtilization.length
    })
  }

  private async getTotalVCpusByDate(startDate: string, endDate: string): Promise<{ [timestamp: string]: number }> {
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

    const vcpusByDate: { [timestamp: string]: number } = {}
    const response = await this.costExplorer.getCostAndUsage(params).promise()
    response.ResultsByTime.reduce((acc, result) => {
      acc[result.TimePeriod.Start] = result.Groups.reduce((sum, group) => {
        return (
          sum + Number.parseInt(group.Metrics.UsageQuantity.Amount) * RDS_INSTANCE_TYPES[group.Keys[0].split(':')[1]]
        )
      }, 0)
      return acc
    }, vcpusByDate)

    return vcpusByDate
  }
}

interface RawComputeUsage {
  cpuUtilization?: number[]
  vCPUCount?: number
  timestamp?: Date
  cpuUtilizationAvg?: number
}

const RDS_INSTANCE_TYPES: { [instanceType: string]: number } = {
  'db.m5.24xlarge': 96,
  'db.m5.16xlarge': 64,
  'db.m5.12xlarge': 48,
  'db.m5.8xlarge': 32,
  'db.m5.4xlarge': 16,
  'db.m5.2xlarge': 8,
  'db.m5.xlarge': 4,
  'db.m5.large': 2,
  'db.m4.16xlarge': 64,
  'db.m4.10xlarge': 40,
  'db.m4.4xlarge': 16,
  'db.m4.2xlarge': 8,
  'db.m4.xlarge': 4,
  'db.m4.large': 2,
  'db.m3.2xlarge': 8,
  'db.m3.xlarge': 4,
  'db.m3.large': 2,
  'db.m3.medium': 1,
  'db.m1.xlarge': 4,
  'db.m1.large': 2,
  'db.m1.medium': 1,
  'db.m1.small': 1,
  'db.z1d.12xlarge': 48,
  'db.z1d.6xlarge': 24,
  'db.z1d.3xlarge': 12,
  'db.z1d.2xlarge': 8,
  'db.z1d.xlarge': 4,
  'db.z1d.large': 2,
  'db.x1e.32xlarge': 128,
  'db.x1e.16xlarge': 64,
  'db.x1e.8xlarge': 32,
  'db.x1e.4xlarge': 16,
  'db.x1e.2xlarge': 8,
  'db.x1e.xlarge': 4,
  'db.x1.32xlarge': 128,
  'db.x1.16xlarge': 64,
  'db.r5.24xlarge': 96,
  'db.r5.16xlarge': 64,
  'db.r5.12xlarge': 48,
  'db.r5.8xlarge': 32,
  'db.r5.4xlarge': 16,
  'db.r5.2xlarge': 8,
  'db.r5.xlarge': 4,
  'db.r5.large': 2,
  'db.r4.16xlarge': 64,
  'db.r4.8xlarge': 32,
  'db.r4.4xlarge': 16,
  'db.r4.2xlarge': 8,
  'db.r4.xlarge': 4,
  'db.r4.large': 2,
  'db.r3.8xlarge': 32,
  'db.r3.4xlarge': 16,
  'db.r3.2xlarge': 8,
  'db.r3.xlarge': 4,
  'db.r3.large': 2,
  'db.m2.4xlarge': 8,
  'db.m2.2xlarge': 4,
  'db.m2.xlarge': 2,
  'db.t3.2xlarge': 8,
  'db.t3.xlarge': 4,
  'db.t3.large': 2,
  'db.t3.medium': 2,
  'db.t3.small': 2,
  'db.t3.micro': 2,
  'db.t2.2xlarge': 8,
  'db.t2.xlarge': 4,
  'db.t2.large': 2,
  'db.t2.medium': 2,
  'db.t2.small': 1,
  'db.t2.micro': 1,
}
