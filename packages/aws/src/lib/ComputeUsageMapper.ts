/*
 * © 2021 ThoughtWorks, Inc.
 */

import { CloudWatch, CostExplorer } from 'aws-sdk'

import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'

import {
  ComputeUsage,
  buildComputeUsages,
  extractRawComputeUsages,
  RawComputeUsage,
} from '@cloud-carbon-footprint/core'

function getNumberVcpusByDate(
  getCostAndUsageResponses: CostExplorer.GetCostAndUsageResponse[],
  NODE_TYPES: { [p: string]: number },
): RawComputeUsage[] {
  const vcpusByDate: RawComputeUsage[] = []
  getCostAndUsageResponses.forEach((response) => {
    response.ResultsByTime.forEach((result) => {
      if (result.Groups.length > 0) {
        vcpusByDate.push({
          timestamp: result.TimePeriod.Start,
          id: 'vCPUs',
          value: result.Groups.reduce((sum, group) => {
            return (
              sum +
              Number.parseInt(group.Metrics.UsageQuantity.Amount) *
                NODE_TYPES[group.Keys[0].split(':')[1]]
            )
          }, 0),
        })
      }
    })
  })
  return vcpusByDate
}

export function getComputeUsage(
  metricDataResponses: CloudWatch.GetMetricDataOutput[],
  getCostAndUsageResponses: CostExplorer.GetCostAndUsageResponse[],
  NODE_TYPES: { [p: string]: number },
): ComputeUsage[] {
  const metricDataResults: MetricDataResult[] = metricDataResponses.flatMap(
    (response) => response.MetricDataResults,
  )
  const rawCpuUtilizations: RawComputeUsage[] = metricDataResults
    .flatMap(extractRawComputeUsages)
    .map((rawComputeUsage) => ({
      ...rawComputeUsage,
      timestamp: rawComputeUsage.timestamp.substr(0, 10),
    }))
  const rawvCpuHours: RawComputeUsage[] = getNumberVcpusByDate(
    getCostAndUsageResponses,
    NODE_TYPES,
  )

  return buildComputeUsages(rawCpuUtilizations.concat(rawvCpuHours))
}
