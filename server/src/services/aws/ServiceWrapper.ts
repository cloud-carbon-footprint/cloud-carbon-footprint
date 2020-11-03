/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { CloudWatch, CostExplorer, CloudWatchLogs } from 'aws-sdk'
import { path } from 'ramda'
import { GetCostAndUsageRequest, GetCostAndUsageResponse } from 'aws-sdk/clients/costexplorer'
import { GetMetricDataInput, GetMetricDataOutput } from 'aws-sdk/clients/cloudwatch'
import { MetricDataResult } from 'aws-sdk/clients/cloudwatch'
import { PartialDataError } from '@application/CreateValidRequest'

export class ServiceWrapper {
  constructor(
    private readonly cloudWatch: CloudWatch,
    private readonly cloudWatchLogs: CloudWatchLogs,
    private readonly costExplorer: CostExplorer,
  ) {}

  private async getCostAndUsageResponse(
    params: CostExplorer.GetCostAndUsageRequest,
  ): Promise<CostExplorer.GetCostAndUsageResponse[]> {
    return [await this.costExplorer.getCostAndUsage(params).promise()]
  }

  private async getMetricDataResponse(
    params: CloudWatch.GetMetricDataInput,
  ): Promise<CloudWatch.GetMetricDataOutput[]> {
    return [await this.cloudWatch.getMetricData(params).promise()]
  }

  private checkForPartialData = (array: Array<MetricDataResult>) => {
    const isPartialData = array.some((obj: MetricDataResult) => obj.StatusCode === 'PartialData')
    if (isPartialData) {
      throw new PartialDataError('Partial Data Returned from AWS')
    }
  }

  public async getQueryByInterval(
    intervalInDays: number,
    func: (start: Date, end: Date, params?: any) => void,
    start: Date,
    end: Date,
    ...args: any
  ): Promise<Array<any>> {
    const startCopy = new Date(start)
    const endCopy = new Date(new Date(start).setDate(start.getDate() + intervalInDays))
    const promiseArray = []

    while (endCopy < end) {
      promiseArray.push(func(startCopy, endCopy, ...args))
      startCopy.setDate(startCopy.getDate() + intervalInDays)
      endCopy.setDate(startCopy.getDate() + intervalInDays)
    }
    promiseArray.push(func(startCopy, end, ...args))

    return Promise.all(promiseArray)
  }

  public async getCloudWatchLogQueryResults(
    params: CloudWatchLogs.GetQueryResultsRequest,
  ): Promise<CloudWatchLogs.GetQueryResultsResponse> {
    return await this.cloudWatchLogs.getQueryResults(params).promise()
  }

  public async describeLogGroups(
    params: CloudWatchLogs.DescribeLogGroupsRequest,
  ): Promise<CloudWatchLogs.DescribeLogGroupsResponse> {
    return await this.cloudWatchLogs.describeLogGroups(params).promise()
  }

  public async startCloudWatchLogsQuery(
    params: CloudWatchLogs.StartQueryRequest,
  ): Promise<CloudWatchLogs.StartQueryResponse> {
    return await this.cloudWatchLogs.startQuery(params).promise()
  }

  @enablePagination('NextPageToken')
  public async getCostAndUsageResponses(params: GetCostAndUsageRequest): Promise<GetCostAndUsageResponse[]> {
    const response = await this.getCostAndUsageResponse(params)
    return response
  }

  @enablePagination('NextToken')
  public async getMetricDataResponses(params: GetMetricDataInput): Promise<GetMetricDataOutput[]> {
    const response = await this.getMetricDataResponse(params)
    this.checkForPartialData(response[0].MetricDataResults)
    return response
  }
}

function enablePagination<RequestType, ResponseType>(nextPageProperty: string) {
  return (target: unknown, propertyKey: string, descriptor?: PropertyDescriptor) => {
    const originalMethod = descriptor.value
    descriptor.value = async function (props: RequestType) {
      const responses: ResponseType[] = []

      let latestResponse: ResponseType
      do {
        const args = [
          {
            ...props,
            [nextPageProperty]: path([responses.length, nextPageProperty], responses),
          },
        ]
        latestResponse = (await originalMethod.apply(this, args))[0]
        responses.push(latestResponse)
      } while (path([nextPageProperty], latestResponse))

      return responses
    }

    return descriptor
  }
}
