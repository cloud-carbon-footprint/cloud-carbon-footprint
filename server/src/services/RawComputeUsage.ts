import { CloudWatch, CostExplorer } from 'aws-sdk'

export class RawComputeUsage {
  cpuUtilizationAvg?: number

  constructor(public cpuUtilization: number[], public vCPUCount?: number, public timestamp?: Date) {
    this.calculateAverages()
  }

  calculateAverages() {
    this.cpuUtilizationAvg =
      this.cpuUtilization.reduce((acc, a) => {
        return acc + a
      }, 0) / this.cpuUtilization.length
  }
}

export const aggregateCPUUtilizationByDay = (
  metricDataResponse: CloudWatch.GetMetricDataOutput,
  getCostAndUsageResponse: CostExplorer.GetCostAndUsageResponse,
  CACHE_NODE_TYPES: { [p: string]: number },
): { [p: string]: RawComputeUsage } => {
  const cpuUtilizationByTimestamp: { [key: string]: number[] } = {}
  const cpuUtilizationData = metricDataResponse.MetricDataResults.filter((a) => a.Id === 'cpuUtilization')
  cpuUtilizationData.forEach((allClustersCPUUtilization) => {
    allClustersCPUUtilization.Timestamps.forEach((timestamp, i) => {
      const key = new Date(timestamp).toISOString().substr(0, 10)
      if (!cpuUtilizationByTimestamp[key]) cpuUtilizationByTimestamp[key] = [allClustersCPUUtilization.Values[i]]
      else cpuUtilizationByTimestamp[key].push(allClustersCPUUtilization.Values[i])
    })
  })

  const vcpusByDate: { [timestamp: string]: number } = {}
  getCostAndUsageResponse.ResultsByTime.reduce((acc, result) => {
    acc[result.TimePeriod.Start] = result.Groups.reduce((sum, group) => {
      return sum + Number.parseInt(group.Metrics.UsageQuantity.Amount) * CACHE_NODE_TYPES[group.Keys[0].split(':')[1]]
    }, 0)
    return acc
  }, vcpusByDate)

  const dataGroupsByTimestamp: { [key: string]: RawComputeUsage } = {}
  Object.entries(cpuUtilizationByTimestamp).forEach(([key, value]) => {
    dataGroupsByTimestamp[key] = new RawComputeUsage(value, vcpusByDate[key], new Date(key))
  })
  return dataGroupsByTimestamp
}
