import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage from '@domain/ComputeUsage'
import { AWSDecorator } from './AWSDecorator'
import Cost from '@domain/Cost'

export default class EC2 extends ServiceWithCPUUtilization {
  serviceName = 'ec2'

  constructor() {
    super()
  }

  async getUsage(start: Date, end: Date, region: string): Promise<ComputeUsage[]> {
    const params = {
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'cpuUtilizationWithEmptyValues',
          Expression: "SEARCH('{AWS/EC2,InstanceId} MetricName=\"CPUUtilization\"', 'Average', 3600)",
          ReturnData: false,
        },
        {
          Id: 'cpuUtilization',
          Expression: 'REMOVE_EMPTY(cpuUtilizationWithEmptyValues)',
        },
        {
          Id: 'vCPUs',
          Expression:
            'SEARCH(\'{AWS/Usage,Resource,Type,Service,Class } Resource="vCPU" MetricName="ResourceCount"\', \'Average\', 3600)',
        },
      ],
      ScanBy: 'TimestampAscending',
    }

    const responses = await new AWSDecorator(region).getMetricDataResponses(params)

    interface RawComputeUsage {
      cpuUtilization?: number[]
      vCPUCount?: number
      timestamp?: Date
      cpuUtilizationAvg?: number
    }
    const result: { [key: string]: RawComputeUsage } = {}

    // Aggregate CPU Utilization
    const metricDataResults = responses.flatMap((response) => {
      return response.MetricDataResults
    })

    const cpuUtilizationData = metricDataResults.filter((a) => a.Id === 'cpuUtilization')
    cpuUtilizationData.forEach((instanceCPUUtilization) => {
      instanceCPUUtilization.Timestamps.forEach((timestamp, i) => {
        const timestampkey = new Date(timestamp).toISOString()
        if (!result[timestampkey])
          result[timestampkey] = { cpuUtilization: [instanceCPUUtilization.Values[i]], timestamp: timestamp }
        else result[timestampkey].cpuUtilization.push(instanceCPUUtilization.Values[i])
      })
    })

    // Add vCPU to result object
    const vCPUData = metricDataResults.filter((a) => a.Id === 'vCPUs')
    vCPUData[0]?.Timestamps.forEach((timestamp, i) => {
      const key = new Date(timestamp).toISOString()
      if (!result[key]) result[key] = { cpuUtilization: [], timestamp: timestamp }
      result[key].vCPUCount = vCPUData[0].Values[i]
    })

    // Apply estimation formula
    Object.values(result).forEach((a) => {
      a.cpuUtilizationAvg =
        a.cpuUtilization.reduce((acc, a) => {
          return acc + a
        }, 0) / a.cpuUtilization.length

      if (isNaN(a.cpuUtilizationAvg)) {
        a.cpuUtilizationAvg = 0.0
      }
    })

    return Object.values(result).map((estimate: RawComputeUsage) => {
      return {
        cpuUtilizationAverage: estimate.cpuUtilizationAvg,
        numberOfvCpus: estimate.vCPUCount,
        timestamp: new Date(estimate.timestamp),
      }
    })
  }

  async getCosts(/* start: Date, end: Date, region: string */): Promise<Cost[]> {
    return []
  }
}
