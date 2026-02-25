/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  GetObjectCommand,
  GetObjectCommandInput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  S3Client,
} from '@aws-sdk/client-s3'

import {
  CloudWatchClient,
  GetMetricDataCommand,
  GetMetricDataCommandInput,
  GetMetricDataCommandOutput,
  MetricDataResult,
} from '@aws-sdk/client-cloudwatch'

import {
  CloudWatchLogsClient,
  DescribeLogGroupsCommand,
  DescribeLogGroupsCommandInput,
  DescribeLogGroupsCommandOutput,
  DescribeQueriesCommand,
  DescribeQueriesCommandInput,
  DescribeQueriesCommandOutput,
  GetQueryResultsCommand as CloudWatchLogsGetQueryResultsCommand,
  GetQueryResultsCommandInput as CloudWatchLogsGetQueryResultsCommandInput,
  GetQueryResultsCommandOutput as CloudWatchLogsGetQueryResultsCommandOutput,
  StartQueryCommand,
  StartQueryCommandInput,
  StartQueryCommandOutput,
} from '@aws-sdk/client-cloudwatch-logs'

import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
  GetCostAndUsageCommandOutput,
  GetRightsizingRecommendationCommand,
  GetRightsizingRecommendationCommandInput,
  GetRightsizingRecommendationCommandOutput,
} from '@aws-sdk/client-cost-explorer'

import {
  AthenaClient,
  GetQueryExecutionCommand,
  GetQueryExecutionCommandInput,
  GetQueryExecutionCommandOutput,
  GetQueryResultsCommand as AthenaGetQueryResultsCommand,
  GetQueryResultsCommandInput as AthenaGetQueryResultsCommandInput,
  GetQueryResultsCommandOutput as AthenaGetQueryResultsCommandOutput,
  StartQueryExecutionCommand,
  StartQueryExecutionCommandInput,
  StartQueryExecutionCommandOutput,
} from '@aws-sdk/client-athena'

import {
  GetTableCommand,
  GetTableCommandInput,
  GetTableCommandOutput,
  GlueClient,
} from '@aws-sdk/client-glue'

import csv from 'csvtojson'
import { path } from 'ramda'
import { Readable } from 'stream'
import { PartialDataError } from '@cloud-carbon-footprint/common'
import { EC2ComputeOptimizerRecommendationData } from './Recommendations/ComputeOptimizer'

export class ServiceWrapper {
  constructor(
    private readonly cloudWatch: CloudWatchClient,
    private readonly cloudWatchLogs: CloudWatchLogsClient,
    private readonly costExplorer: CostExplorerClient,
    private readonly s3: S3Client,
    private readonly athena?: AthenaClient,
    private readonly glue?: GlueClient,
  ) {}

  private async getCostAndUsageResponse(
    params: GetCostAndUsageCommandInput,
  ): Promise<GetCostAndUsageCommandOutput[]> {
    return [await this.costExplorer.send(new GetCostAndUsageCommand(params))]
  }

  private async getMetricDataResponse(
    params: GetMetricDataCommandInput,
  ): Promise<GetMetricDataCommandOutput[]> {
    return [await this.cloudWatch.send(new GetMetricDataCommand(params))]
  }

  private async getRightsizingRecommendationResponse(
    params: GetRightsizingRecommendationCommandInput,
  ): Promise<GetRightsizingRecommendationCommandOutput[]> {
    return [
      await this.costExplorer.send(
        new GetRightsizingRecommendationCommand(params),
      ),
    ]
  }

  private async getAthenaQueryResults(
    queryExecutionInput: AthenaGetQueryResultsCommandInput,
  ): Promise<AthenaGetQueryResultsCommandOutput[]> {
    if (!this.athena) throw new Error('Athena client not configured')
    return [
      await this.athena.send(
        new AthenaGetQueryResultsCommand(queryExecutionInput),
      ),
    ]
  }

  private checkForPartialData = (array: Array<MetricDataResult>) => {
    const isPartialData = array.some(
      (obj: MetricDataResult) => obj.StatusCode === 'PartialData',
    )
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
    let startCopy = new Date(start)
    let endCopy = new Date(
      new Date(start).setDate(start.getDate() + intervalInDays),
    )
    const promiseArray = []

    while (endCopy < end) {
      promiseArray.push(func(startCopy, endCopy, ...args))
      startCopy = new Date(
        new Date(startCopy).setDate(start.getDate() + intervalInDays),
      )
      endCopy = new Date(
        new Date(startCopy).setDate(start.getDate() + intervalInDays),
      )
    }
    promiseArray.push(func(startCopy, end, ...args))
    return Promise.all(promiseArray)
  }

  public async getCloudWatchLogQueryResults(
    params: CloudWatchLogsGetQueryResultsCommandInput,
  ): Promise<CloudWatchLogsGetQueryResultsCommandOutput> {
    return await this.cloudWatchLogs.send(
      new CloudWatchLogsGetQueryResultsCommand(params),
    )
  }

  public async describeLogGroups(
    params: DescribeLogGroupsCommandInput,
  ): Promise<DescribeLogGroupsCommandOutput> {
    return await this.cloudWatchLogs.send(new DescribeLogGroupsCommand(params))
  }

  public async describeCloudWatchLogsQueries(
    params: DescribeQueriesCommandInput,
  ): Promise<DescribeQueriesCommandOutput> {
    return await this.cloudWatchLogs.send(new DescribeQueriesCommand(params))
  }

  public async startCloudWatchLogsQuery(
    params: StartQueryCommandInput,
  ): Promise<StartQueryCommandOutput> {
    return await this.cloudWatchLogs.send(new StartQueryCommand(params))
  }

  public async startAthenaQueryExecution(
    queryParams: StartQueryExecutionCommandInput,
  ): Promise<StartQueryExecutionCommandOutput> {
    if (!this.athena) throw new Error('Athena client not configured')
    return await this.athena.send(new StartQueryExecutionCommand(queryParams))
  }

  public async getAthenaQueryExecution(
    queryExecutionInput: GetQueryExecutionCommandInput,
  ): Promise<GetQueryExecutionCommandOutput> {
    if (!this.athena) throw new Error('Athena client not configured')
    return await this.athena.send(
      new GetQueryExecutionCommand(queryExecutionInput),
    )
  }

  @enablePagination('NextToken')
  public async getAthenaQueryResultSets(
    queryExecutionInput: AthenaGetQueryResultsCommandInput,
  ): Promise<AthenaGetQueryResultsCommandOutput[]> {
    return await this.getAthenaQueryResults(queryExecutionInput)
  }

  @enablePagination('NextPageToken')
  public async getCostAndUsageResponses(
    params: GetCostAndUsageCommandInput,
  ): Promise<GetCostAndUsageCommandOutput[]> {
    return await this.getCostAndUsageResponse(params)
  }

  @enablePagination('NextToken')
  public async getMetricDataResponses(
    params: GetMetricDataCommandInput,
  ): Promise<GetMetricDataCommandOutput[]> {
    const response = await this.getMetricDataResponse(params)
    this.checkForPartialData(response[0].MetricDataResults)
    return response
  }

  @enablePagination('NextPageToken')
  public async getRightsizingRecommendationsResponses(
    params: GetRightsizingRecommendationCommandInput,
  ): Promise<GetRightsizingRecommendationCommandOutput[]> {
    return await this.getRightsizingRecommendationResponse(params)
  }

  public async listBucketObjects(
    params: ListObjectsV2CommandInput,
  ): Promise<ListObjectsV2CommandOutput> {
    return await this.s3.send(new ListObjectsV2Command(params))
  }

  public async getComputeOptimizerRecommendationsResponse(
    params: GetObjectCommandInput,
  ): Promise<EC2ComputeOptimizerRecommendationData[]> {
    const response = await this.s3.send(new GetObjectCommand(params))
    if (!response.Body) {
      throw new Error('GetObject response has no Body')
    }
    const nodeStream =
      response.Body instanceof Readable
        ? response.Body
        : Readable.from(response.Body as AsyncIterable<Uint8Array>)
    const parsedCsv = await csv().fromStream(nodeStream)
    return JSON.parse(JSON.stringify(parsedCsv))
  }

  public async getAthenaTableDescription(
    params: GetTableCommandInput,
  ): Promise<GetTableCommandOutput> {
    if (!this.glue) throw new Error('Glue client not configured')
    return await this.glue.send(new GetTableCommand(params))
  }
}

function enablePagination<RequestType, ResponseType>(nextPageProperty: string) {
  return (
    target: unknown,
    propertyKey: string,
    descriptor?: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value
    descriptor.value = async function (props: RequestType) {
      const responses: ResponseType[] = []

      let latestResponse: ResponseType
      do {
        const args = [
          {
            ...props,
            [nextPageProperty]: path(
              [responses.length - 1, nextPageProperty],
              responses,
            ),
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
