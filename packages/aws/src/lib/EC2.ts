/*
 * © 2021 Thoughtworks, Inc.
 */

import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import {
  Cost,
  ComputeUsage,
  buildComputeUsages,
  extractRawComputeUsages,
  RawComputeUsage,
  ServiceWithCPUUtilization,
  CloudConstants,
} from '@cloud-carbon-footprint/core'

import { getCostFromCostExplorer } from './CostMapper'

import { ServiceWrapper } from './ServiceWrapper'
import { AWS_CLOUD_CONSTANTS } from '../domain'

export default class EC2 extends ServiceWithCPUUtilization {
  serviceName = 'EC2'

  constructor(private serviceWrapper: ServiceWrapper) {
    super()
  }

  async getUsage(start: Date, end: Date): Promise<ComputeUsage[]> {
    const response = await this.serviceWrapper.getQueryByInterval(
      30,
      this.runQuery,
      start,
      end,
    )
    return response.flat()
  }

  private runQuery = async (
    start: Date,
    end: Date,
  ): Promise<ComputeUsage[]> => {
    const params = {
      StartTime: start,
      EndTime: end,
      MetricDataQueries: [
        {
          Id: 'cpuUtilizationWithEmptyValues',
          Expression:
            "SEARCH('{AWS/EC2,InstanceId} MetricName=\"CPUUtilization\"', 'Average', 3600)",
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

    const responses = await this.serviceWrapper.getMetricDataResponses(params)

    const metricDataResults: MetricDataResult[] = responses.flatMap(
      (response) => response.MetricDataResults,
    )

    const rawComputeUsages: RawComputeUsage[] = metricDataResults.flatMap(
      extractRawComputeUsages,
    )
    const cloudConstants: CloudConstants = {
      avgCpuUtilization: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
    }
    return buildComputeUsages(rawComputeUsages, cloudConstants)
  }

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    const params: GetCostAndUsageRequest = {
      TimePeriod: {
        Start: start.toISOString().substr(0, 10),
        End: end.toISOString().substr(0, 10),
      },
      Filter: {
        And: [
          {
            Dimensions: {
              Key: 'REGION',
              Values: [region],
            },
          },
          {
            Dimensions: {
              Key: 'USAGE_TYPE_GROUP',
              Values: ['EC2: Running Hours'],
            },
          },
        ],
      },
      Granularity: 'DAILY',
      GroupBy: [
        {
          Key: 'USAGE_TYPE',
          Type: 'DIMENSION',
        },
      ],
      Metrics: ['AmortizedCost'],
    }
    return getCostFromCostExplorer(params, this.serviceWrapper)
  }
}
