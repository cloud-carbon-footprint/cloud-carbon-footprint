/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import { estimateCo2, CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import { getCostFromCostExplorer } from '@services/aws/CostMapper'
import Cost from '@domain/Cost'
import { isEmpty } from 'ramda'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'

export default class Lambda implements ICloudService {
  serviceName = 'lambda'

  constructor(private TIMEOUT = 60000, private POLL_INTERVAL = 1000, private readonly serviceWrapper: ServiceWrapper) {}

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const groupNames = await this.getLambdaLogGroupNames()

    if (isEmpty(groupNames)) {
      return []
    }
    const queryIdsArray = await this.getQueryIdsArray(groupNames, start, end)

    let usage: any[] = []
    for (const queryId of queryIdsArray) {
      usage = usage.concat(await Promise.all(queryId.map((id) => this.getResults(id.toString()))))
    }

    const filteredResults = [...usage.reduce((combinedArr, { results }) => [...combinedArr, ...results], [])]

    return filteredResults.map((resultByDate) => {
      const timestampField = resultByDate[0]
      const wattsField = resultByDate[1]
      const timestamp = new Date(timestampField.value.substr(0, 10))
      const wattHours = Number.parseFloat(wattsField.value) * CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS
      const co2e = estimateCo2(wattHours, 'AWS', region)
      return {
        timestamp,
        wattHours,
        co2e,
      }
    })
  }

  private async getQueryIdsArray(groupNames: string[][], start: Date, end: Date) {
    const queryIdsArray: string[][] = []

    for (const logGroup of groupNames) {
      const queryIds: string[] = await Promise.all(
        await this.serviceWrapper.getQueryByInterval(60, this.runQuery, start, end, logGroup),
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
    const extractedLogGroupNames = logGroupData.logGroups.map(({ logGroupName }) => logGroupName)
    const numberOfLogGroupsInIntervalsOfTwenty = Math.floor(extractedLogGroupNames.length / 20)
    const LogGroupsInIntervalsOfTwenty: string[][] = []
    for (let i = 0; i <= numberOfLogGroupsInIntervalsOfTwenty; i++) {
      const firstIndex = i + i * 19
      const lastIndex =
        firstIndex + 20 < extractedLogGroupNames.length ? firstIndex + 20 : extractedLogGroupNames.length
      const slicedArr = extractedLogGroupNames.slice(firstIndex, lastIndex)
      slicedArr.length > 0 ? LogGroupsInIntervalsOfTwenty.push(slicedArr) : null
    }
    return LogGroupsInIntervalsOfTwenty
  }

  private runQuery = async (start: Date, end: Date, groupNames: string[]): Promise<string> => {
    const query = `
            filter @type = "REPORT"
            | fields datefloor(@timestamp, 1d) as Date, @duration/1000 as DurationInS, @memorySize/1000000 as MemorySetInMB, ${CLOUD_CONSTANTS.AWS.MAX_WATTS} * DurationInS/3600 * MemorySetInMB/1792 as wattsPerFunction
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

  private async getResults(queryId: string) {
    const params = {
      queryId: queryId,
    }
    let cwResultsData
    const startTime = Date.now()

    while (true) {
      cwResultsData = await this.serviceWrapper.getCloudWatchLogQueryResults(params)
      if (cwResultsData.status !== 'Running' && cwResultsData.status !== 'Scheduled') break
      if (Date.now() - startTime > this.TIMEOUT) {
        throw new Error(`CloudWatchLog request failed, status: ${cwResultsData.status}`)
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
