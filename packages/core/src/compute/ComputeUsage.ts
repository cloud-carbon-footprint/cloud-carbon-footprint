/*
 * © 2021 Thoughtworks, Inc.
 */

import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'
import { IUsageData, CloudConstants } from '../.'

export default interface ComputeUsage extends IUsageData {
  cpuUtilizationAverage: number
  vCpuHours: number
  usesAverageCPUConstant: boolean
}

export class ComputeUsageBuilder {
  private timestamp: string
  private cpuUtilizations: number[]
  private vCpuHours: number
  private constants: CloudConstants

  constructor(timestamp: string, constants: CloudConstants) {
    this.timestamp = timestamp
    this.cpuUtilizations = []
    this.vCpuHours = 0
    this.constants = constants
  }

  addCpuUtilization(cpuUtilization: number): ComputeUsageBuilder {
    if (cpuUtilization) {
      this.cpuUtilizations.push(cpuUtilization)
    }
    return this
  }

  setVCpuHours(vCpuHours: number): ComputeUsageBuilder {
    this.vCpuHours = vCpuHours
    return this
  }

  build(): ComputeUsage {
    const hasMeasurements = this.cpuUtilizations.length > 0
    const cpuUtilizationAverage = hasMeasurements
      ? this.cpuUtilizations.reduce((sum, x) => sum + x) /
        this.cpuUtilizations.length
      : this.constants.avgCpuUtilization
    return {
      timestamp: new Date(this.timestamp),
      cpuUtilizationAverage: cpuUtilizationAverage as number,
      vCpuHours: this.vCpuHours,
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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const extractRawComputeUsages: (
  mdr: MetricDataResult,
) => RawComputeUsage[] = (metricData: MetricDataResult) =>
  metricData.Timestamps?.map((timestamp, i) => ({
    timestamp: new Date(timestamp).toISOString(),
    id: metricData.Id ?? 'id',
    value: metricData.Values ? metricData.Values[i] : 0,
  }))

const mergeUsageByTimestamp = (
  acc: GroupedComputeUsages,
  data: RawComputeUsage,
  constants: CloudConstants,
) => {
  const usageToUpdate =
    acc[data.timestamp] || new ComputeUsageBuilder(data.timestamp, constants)
  if (data.id === 'cpuUtilization') {
    acc[data.timestamp] = usageToUpdate.addCpuUtilization(data.value)
  } else if (data.id === 'vCPUs') {
    acc[data.timestamp] = usageToUpdate.setVCpuHours(data.value)
  }
  return acc
}

export function buildComputeUsages(
  rawComputeUsages: RawComputeUsage[],
  constants: CloudConstants,
): ComputeUsage[] {
  const groupedComputeUsages: GroupedComputeUsages = rawComputeUsages.reduce(
    (acc, data) => mergeUsageByTimestamp(acc, data, constants),
    {},
  )
  return Object.values(groupedComputeUsages)
    .map((builder: ComputeUsageBuilder) => builder.build())
    .filter((usage: ComputeUsage) => usage.vCpuHours > 0)
}
