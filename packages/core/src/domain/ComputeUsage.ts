/*
 * © 2021 ThoughtWorks, Inc.
 */

import IUsageData from './IUsageData'
import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'

export default interface ComputeUsage extends IUsageData {
  cpuUtilizationAverage: number
  numberOfvCpus: number
  usesAverageCPUConstant: boolean
}

export class ComputeUsageBuilder {
  private timestamp: string
  private cpuUtilizations: number[]
  private numberOfvCpus: number

  constructor(timestamp: string) {
    this.timestamp = timestamp
    this.cpuUtilizations = []
    this.numberOfvCpus = 0
  }

  addCpuUtilization(cpuUtilization: number): ComputeUsageBuilder {
    if (cpuUtilization) {
      this.cpuUtilizations.push(cpuUtilization)
    }
    return this
  }

  setNumberOfvCpus(numberOfvCpus: number): ComputeUsageBuilder {
    this.numberOfvCpus = numberOfvCpus
    return this
  }

  build(): ComputeUsage {
    const hasMeasurements = this.cpuUtilizations.length > 0
    const cpuUtilizationAverage = hasMeasurements
      ? this.cpuUtilizations.reduce((sum, x) => sum + x) /
        this.cpuUtilizations.length
      : 50 //avg cpu utilization 2020
    return {
      timestamp: new Date(this.timestamp),
      cpuUtilizationAverage,
      numberOfvCpus: this.numberOfvCpus,
      usesAverageCPUConstant: !hasMeasurements,
    }
  }
}

export interface RawComputeUsage {
  id: string
  timestamp: string
  value: number
}

type GroupedComputeUsages = { [timestamp: string]: ComputeUsageBuilder }

export const extractRawComputeUsages: (
  mdr: MetricDataResult,
) => RawComputeUsage[] = (metricData: MetricDataResult) =>
  metricData.Timestamps.map((timestamp, i) => ({
    timestamp: new Date(timestamp).toISOString(),
    id: metricData.Id,
    value: metricData.Values[i],
  }))

const mergeUsageByTimestamp = (
  acc: GroupedComputeUsages,
  data: RawComputeUsage,
) => {
  const usageToUpdate =
    acc[data.timestamp] || new ComputeUsageBuilder(data.timestamp)
  if (data.id === 'cpuUtilization') {
    acc[data.timestamp] = usageToUpdate.addCpuUtilization(data.value)
  } else if (data.id === 'vCPUs') {
    acc[data.timestamp] = usageToUpdate.setNumberOfvCpus(data.value)
  }
  return acc
}

export function buildComputeUsages(
  rawComputeUsages: RawComputeUsage[],
): ComputeUsage[] {
  const groupedComputeUsages: GroupedComputeUsages = rawComputeUsages.reduce(
    (acc, data) => mergeUsageByTimestamp(acc, data),
    {},
  )
  return Object.values(groupedComputeUsages)
    .map((builder: ComputeUsageBuilder) => builder.build())
    .filter((usage: ComputeUsage) => usage.numberOfvCpus > 0)
}
