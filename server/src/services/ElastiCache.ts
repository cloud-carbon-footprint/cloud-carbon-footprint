import AWS from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'
import ComputeService from '@domain/ComputeService'
import { CACHE_NODE_TYPES } from '@domain/constants'

export default class ElastiCache extends ComputeService {
  serviceName = 'elasticache'
  readonly cloudWatch: AWS.CloudWatch
  readonly elastiCache: AWS.ElastiCache

  constructor() {
    super()
    this.cloudWatch = new AWS.CloudWatch()
    this.elastiCache = new AWS.ElastiCache()
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
    const responseCacheCluster = await this.elastiCache.describeCacheClusters().promise()

    const vCPUPerCluster = responseCacheCluster.CacheClusters.map(
      (cluster) => cluster.NumCacheNodes * CACHE_NODE_TYPES[cluster.CacheNodeType],
    )

    const totalNumberOfvCpus = vCPUPerCluster.reduce((acc, x) => acc + x, 0)

    interface RawComputeUsage {
      cpuUtilization?: number[]
      vCPUCount?: number
      timestamp?: Date
      cpuUtilizationAvg?: number
    }
    const result: { [key: string]: RawComputeUsage } = {}

    // Aggregate CPU Utilization
    const metricDataResults = responseMetricData.MetricDataResults
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
          numberOfvCpus: totalNumberOfvCpus,
        }
      } else {
        estimationsByDay[date].cpuUtilizationAverage += a.cpuUtilizationAvg
        // estimationsByDay[date].numberOfvCpus += a.vCPUCount
      }
    })

    return Object.values(estimationsByDay)
  }
}
