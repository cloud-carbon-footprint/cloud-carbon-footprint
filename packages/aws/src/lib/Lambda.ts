/*
 * © 2021 Thoughtworks, Inc.
 */

import { GetQueryResultsResponse } from 'aws-sdk/clients/cloudwatchlogs'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import {
  ICloudService,
  FootprintEstimate,
  Cost,
  estimateCo2,
} from '@cloud-carbon-footprint/core'

import { getCostFromCostExplorer } from './CostMapper'
import { isEmpty } from 'ramda'
import { ServiceWrapper } from './ServiceWrapper'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain/'

export default class Lambda implements ICloudService {
  private readonly LOG_GROUP_SIZE_REQUEST_LIMIT = 20
  serviceName = 'Lambda'

  constructor(
    private TIMEOUT = 60000,
    private POLL_INTERVAL = 1000,
    private readonly serviceWrapper: ServiceWrapper,
  ) {}

  async getEstimates(
    start: Date,
    end: Date,
    region: string,
  ): Promise<FootprintEstimate[]> {
    const groupNames = await this.getLambdaLogGroupNames()

    if (isEmpty(groupNames)) {
      return []
    }
    const queryIdsArray = await this.getQueryIdsArray(groupNames, start, end)

    let usage: GetQueryResultsResponse[] = []
    for (const queryId of queryIdsArray) {
      usage = usage.concat(
        await Promise.all(queryId.map((id) => this.getResults(id.toString()))),
      )
    }

    const filteredResults = [
      ...usage.reduce(
        (combinedArr, { results }) => [...combinedArr, ...results],
        [],
      ),
    ]

    return filteredResults.map((resultByDate) => {
      const timestampField = resultByDate[0]
      const wattsField = resultByDate[1]
      const timestamp = new Date(timestampField.value.substr(0, 10))
      const wattHours =
        Number.parseFloat(wattsField.value) * AWS_CLOUD_CONSTANTS.getPUE()
      const co2e = estimateCo2(
        wattHours,
        region,
        AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      )
      return {
        timestamp,
        kilowattHours: wattHours,
        co2e,
      }
    })
  }

  private async getQueryIdsArray(
    groupNames: string[][],
    start: Date,
    end: Date,
  ): Promise<string[][]> {
    const queryIdsArray: string[][] = []

    for (const logGroup of groupNames) {
      const queryIds: string[] = await Promise.all(
        await this.serviceWrapper.getQueryByInterval(
          60,
          this.runQuery,
          start,
          end,
          logGroup,
        ),
      )
      queryIdsArray.push(queryIds)
    }
    return queryIdsArray
  }

  private async getLambdaLogGroupNames(): Promise<string[][]> {
    const params = {
      logGroupNamePrefix: '/aws/lambda',
    }

    const logGroupData = await this.serviceWrapper.describeLogGroups(params)
    const extractedLogGroupNames = logGroupData.logGroups.map(
      ({ logGroupName }) => logGroupName,
    )
    const logGroupsInIntervalsOfTwenty: string[][] = []
    while (extractedLogGroupNames.length) {
      logGroupsInIntervalsOfTwenty.push(
        extractedLogGroupNames.splice(0, this.LOG_GROUP_SIZE_REQUEST_LIMIT),
      )
    }
    return logGroupsInIntervalsOfTwenty
  }

  private runQuery = async (
    start: Date,
    end: Date,
    groupNames: string[],
  ): Promise<string> => {
    const averageWatts =
      AWS_CLOUD_CONSTANTS.MIN_WATTS_AVG +
      (AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020 / 100) *
        (AWS_CLOUD_CONSTANTS.MAX_WATTS_AVG - AWS_CLOUD_CONSTANTS.MIN_WATTS_AVG)

    const query = `
            filter @type = "REPORT"
            | fields datefloor(@timestamp, 1d) as Date, @duration/1000 as DurationInS, @memorySize/1000000 as MemorySetInMB, ${averageWatts} * DurationInS/3600 * MemorySetInMB/1792 as wattsPerFunction
            | stats sum(wattsPerFunction) as Watts by Date 
            | sort Date asc`

    const params = {
      startTime: start.getTime(),
      endTime: end.getTime(),
      queryString: query,
      logGroupNames: groupNames,
    }

    const queryData = await this.serviceWrapper.startCloudWatchLogsQuery(params)

    return queryData.queryId
  }

  private async getResults(queryId: string): Promise<GetQueryResultsResponse> {
    const params = {
      queryId: queryId,
    }
    let cwResultsData
    const startTime = Date.now()

    while (true) {
      cwResultsData = await this.serviceWrapper.getCloudWatchLogQueryResults(
        params,
      )
      if (
        cwResultsData.status !== 'Running' &&
        cwResultsData.status !== 'Scheduled'
      )
        break
      if (Date.now() - startTime > this.TIMEOUT) {
        throw new Error(
          `CloudWatchLog request failed, status: ${cwResultsData.status}`,
        )
      }
      await wait(this.POLL_INTERVAL)
    }
    return cwResultsData
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
              Key: 'SERVICE',
              Values: ['AWS Lambda'],
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

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
