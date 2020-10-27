/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import ServiceWithCPUUtilization from '@domain/ServiceWithCPUUtilization'
import ComputeUsage, { buildComputeUsages, extractRawComputeUsages, RawComputeUsage } from '@domain/ComputeUsage'
import Cost from '@domain/Cost'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import { getCostFromCostExplorer } from '@services/aws/CostMapper'
import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

export default class EC2 extends ServiceWithCPUUtilization {
  serviceName = 'ec2'

  constructor(private serviceWrapper: ServiceWrapper) {
    super()
  }

  async getUsage(start: Date, end: Date): Promise<ComputeUsage[]> {

    const response = await this.serviceWrapper.getQueryByInterval(30, this.runQuery.bind(this), start, end)
    const flattenedResp = response.reduce((acc, data) => [...data, ...acc], [])
    return flattenedResp
  }

  private async runQuery(start: Date, end: Date): Promise<ComputeUsage[]>{
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

    const responses = await this.serviceWrapper.getMetricDataResponses(params)

    const metricDataResults: MetricDataResult[] = responses.flatMap((response) => response.MetricDataResults)
    
    const rawComputeUsages: RawComputeUsage[] = metricDataResults.flatMap(extractRawComputeUsages)
    return buildComputeUsages(rawComputeUsages, 'AWS')
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
