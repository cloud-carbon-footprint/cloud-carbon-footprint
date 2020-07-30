import { CloudWatch, CostExplorer } from 'aws-sdk'
import ComputeUsage from '@domain/ComputeUsage'

function getCPUUtilizationByTimestamp(metricDataResponse: CloudWatch.GetMetricDataOutput) {
  const cpuUtilizationByTimestamp: { [key: string]: number[] } = {}
  const cpuUtilizationData = metricDataResponse.MetricDataResults.filter((a) => a.Id === 'cpuUtilization')
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
  getCostAndUsageResponse: CostExplorer.GetCostAndUsageResponse,
  NODE_TYPES: { [p: string]: number },
) {
  const vcpusByDate: { [timestamp: string]: number } = {}
  getCostAndUsageResponse.ResultsByTime.reduce((acc, result) => {
    acc[result.TimePeriod.Start] = result.Groups.reduce((sum, group) => {
      return sum + Number.parseInt(group.Metrics.UsageQuantity.Amount) * NODE_TYPES[group.Keys[0].split(':')[1]]
    }, 0)
    return acc
  }, vcpusByDate)
  return vcpusByDate
}

function calculateAverages(cpuUtilization: number[]): number {
  return (
    cpuUtilization.reduce((acc, a) => {
      return acc + a
    }, 0) / cpuUtilization.length
  )
}

function buildComputeUsage(cpuUtilizationByTimestamp: { [p: string]: number[] }, vcpusByDate: { [p: string]: number }) {
  const dataGroupsByTimestamp: { [key: string]: ComputeUsage } = {}
  Object.entries(cpuUtilizationByTimestamp).forEach(([timestamp, cpuUtilization]) => {
    dataGroupsByTimestamp[timestamp] = {
      timestamp: new Date(timestamp),
      cpuUtilizationAverage: calculateAverages(cpuUtilization),
      numberOfvCpus: vcpusByDate[timestamp],
    }
  })

  return Object.values(dataGroupsByTimestamp)
}

export function getComputeUsage(
  metricDataResponse: CloudWatch.GetMetricDataOutput,
  getCostAndUsageResponse: CostExplorer.GetCostAndUsageResponse,
  NODE_TYPES: { [p: string]: number },
): ComputeUsage[] {
  const cpuUtilizationByTimestamp = getCPUUtilizationByTimestamp(metricDataResponse)
  const vcpusByDate = getNumberVcpusByDate(getCostAndUsageResponse, NODE_TYPES)
  return buildComputeUsage(cpuUtilizationByTimestamp, vcpusByDate)
}
