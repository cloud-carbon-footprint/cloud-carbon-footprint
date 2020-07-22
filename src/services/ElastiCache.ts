import AWS from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'
import ComputeService from '@domain/ComputeService'

export default class ElastiCache extends ComputeService {
  serviceName = 'elasticache'
  readonly cloudWatch: AWS.CloudWatch

  constructor() {
    super()
    this.cloudWatch = new AWS.CloudWatch({
      region: 'us-east-1',
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

    const response = await this.cloudWatch.getMetricData(params).promise()

    interface RawComputeUsage {
      cpuUtilization?: number[]
      // vCPUCount?: number
      timestamp?: Date
      cpuUtilizationAvg?: number
    }
    const result: { [key: string]: RawComputeUsage } = {}

    // Aggregate CPU Utilization
    const metricDataResults = response.MetricDataResults
    const cpuUtilizationData = metricDataResults.filter((a) => a.Id === 'cpuUtilization')
    cpuUtilizationData.forEach((instanceCPUUtilization) => {
      instanceCPUUtilization.Timestamps.forEach((timestamp, i) => {
        const key = new Date(timestamp).toISOString()
        if (!result[key]) result[key] = { cpuUtilization: [instanceCPUUtilization.Values[i]], timestamp: timestamp }
        result[key].cpuUtilization.push()
      })
    })

    // Add vCPU to result object
    // const vCPUData = metricDataResults.filter((a) => a.Id === 'vCPUs')
    // vCPUData[0].Timestamps.forEach((timestamp, i) => {
    //   const key = new Date(timestamp).toISOString()
    //   if (!result[key]) result[key] = { cpuUtilization: [], timestamp: timestamp }
    //   result[key].vCPUCount = vCPUData[0].Values[i]
    // })

    // Apply estimation formula
    Object.values(result).forEach((a) => {
      a.cpuUtilizationAvg =
        a.cpuUtilization.reduce((acc, a) => {
          return acc + a
        }, 0) / a.cpuUtilization.length
    })

    // Aggregate by date
    const estimationsByDay: { [timestamp: string]: ComputeUsage } = {}
    Object.values(result).forEach((a) => {
      const timestamp = new Date(a.timestamp)
      const date = timestamp.toISOString().substr(0, 10)

      if (!estimationsByDay[date]) {
        estimationsByDay[date] = {
          timestamp: new Date(date),
          cpuUtilizationAverage: a.cpuUtilizationAvg,
          numberOfvCpus: 1,
        }
      } else {
        estimationsByDay[date].cpuUtilizationAverage += a.cpuUtilizationAvg
        // estimationsByDay[date].numberOfvCpus += a.vCPUCount
      }
    })

    return Object.values(estimationsByDay)
  }
}
