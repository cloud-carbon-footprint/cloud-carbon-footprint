/*
 * © 2021 Thoughtworks, Inc.
 */

import { CloudWatch, CostExplorer } from 'aws-sdk'

import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'

import {
  ComputeUsage,
  buildComputeUsages,
  extractRawComputeUsages,
  RawComputeUsage,
  CloudConstants,
} from '@cloud-carbon-footprint/core'
import { AWS_CLOUD_CONSTANTS } from '../domain'

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

  const cloudConstants: CloudConstants = {
    avgCpuUtilization: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
  }

  return buildComputeUsages(
    rawCpuUtilizations.concat(rawvCpuHours),
    cloudConstants,
  )
}
