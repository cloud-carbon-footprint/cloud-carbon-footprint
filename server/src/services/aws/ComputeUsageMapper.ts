import { CloudWatch, CostExplorer } from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'
import { AVG_CPU_UTILIZATION_2020 } from '@domain/FootprintEstimationConstants'

function getCPUUtilizationByTimestamp(metricDataResponses: CloudWatch.GetMetricDataOutput[]) {
  const cpuUtilizationByTimestamp: { [key: string]: number[] } = {}

  const cpuUtilizationData: CloudWatch.MetricDataResult[] = metricDataResponses.flatMap((metricDataResponse) => {
    return metricDataResponse.MetricDataResults.filter((metricData) => metricData.Id === 'cpuUtilization')
  })

  cpuUtilizationData.forEach((allClustersCPUUtilization) => {
    allClustersCPUUtilization.Timestamps.forEach((timestamp, i) => {
      const key = new Date(timestamp).toISOString().substr(0, 10)
      if (!cpuUtilizationByTimestamp[key]) cpuUtilizationByTimestamp[key] = [allClustersCPUUtilization.Values[i]]
      else cpuUtilizationByTimestamp[key].push(allClustersCPUUtilization.Values[i])
    })
  })
  return cpuUtilizationByTimestamp
}

function getNumberVcpusByDate(
  getCostAndUsageResponses: CostExplorer.GetCostAndUsageResponse[],
  NODE_TYPES: { [p: string]: number },
) {
  const vcpusByDate: { [timestamp: string]: number } = {}
  getCostAndUsageResponses.forEach((response) => {
    response.ResultsByTime.reduce((acc, result) => {
      if (result.Groups.length > 0) {
        acc[result.TimePeriod.Start] = result.Groups.reduce((sum, group) => {
          return sum + Number.parseInt(group.Metrics.UsageQuantity.Amount) * NODE_TYPES[group.Keys[0].split(':')[1]]
        }, 0)
      }
      return acc
    }, vcpusByDate)
  })
  return vcpusByDate
}

function calculateAverages(cpuUtilization: number[]): number {
  if (cpuUtilization) {
    return (
      cpuUtilization.reduce((acc, a) => {
        return acc + a
      }, 0) / cpuUtilization.length
    )
  }
  return AVG_CPU_UTILIZATION_2020
}

function buildComputeUsage(cpuUtilizationByTimestamp: { [p: string]: number[] }, vcpusByDate: { [p: string]: number }) {
  const dataGroupsByTimestamp: { [key: string]: ComputeUsage } = {}
  Object.entries(vcpusByDate).forEach(([timestamp]) => {
    dataGroupsByTimestamp[timestamp] = {
      timestamp: new Date(timestamp),
      cpuUtilizationAverage: calculateAverages(cpuUtilizationByTimestamp[timestamp]),
      numberOfvCpus: vcpusByDate[timestamp],
    }
  })

  return Object.values(dataGroupsByTimestamp)
}

export function getComputeUsage(
  metricDataResponses: CloudWatch.GetMetricDataOutput[],
  getCostAndUsageResponses: CostExplorer.GetCostAndUsageResponse[],
  NODE_TYPES: { [p: string]: number },
): ComputeUsage[] {
  const cpuUtilizationByTimestamp = getCPUUtilizationByTimestamp(metricDataResponses)
  const vcpusByDate = getNumberVcpusByDate(getCostAndUsageResponses, NODE_TYPES)
  return buildComputeUsage(cpuUtilizationByTimestamp, vcpusByDate)
}
