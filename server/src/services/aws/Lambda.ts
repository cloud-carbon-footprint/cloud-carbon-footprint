import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import { estimateCo2, MAX_WATTS } from '@domain/FootprintEstimationConstants'
import { getCostFromCostExplorer } from '@services/aws/CostMapper'
import Cost from '@domain/Cost'
import { isEmpty } from 'ramda'
import { GetCostAndUsageRequest } from 'aws-sdk/clients/costexplorer'
import AWS from 'aws-sdk'

export default class Lambda implements ICloudService {
  serviceName = 'lambda'

  constructor(private TIMEOUT = 60000, private POLL_INTERVAL = 1000) {}

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const cloudWatchLogs = new AWS.CloudWatchLogs({ region: region }) //TODO: dependency injection
    const groupNames = await this.getLambdaLogGroupNames(cloudWatchLogs)

    if (isEmpty(groupNames)) {
      return [{ timestamp: start, wattHours: 0.0, co2e: 0.0 }]
    }

    const queryId = await this.runQuery(cloudWatchLogs, start, end, groupNames)
    const usage = await this.getResults(cloudWatchLogs, queryId)

    return usage.results.map((resultByDate) => {
      const timestampField = resultByDate[0]
      const wattsField = resultByDate[1]

      const timestamp = new Date(timestampField.value.substr(0, 10))
      const wattHours = Number.parseFloat(wattsField.value)
      const co2e = estimateCo2(wattHours, region)
      return {
        timestamp,
        wattHours,
        co2e,
      }
    })
  }

  private async getLambdaLogGroupNames(cw: AWS.CloudWatchLogs): Promise<string[]> {
    const params = {
      logGroupNamePrefix: '/aws/lambda',
    }

    const logGroupData = await cw.describeLogGroups(params).promise()
    return logGroupData.logGroups.map(({ logGroupName }) => logGroupName)
  }

  private async runQuery(cw: AWS.CloudWatchLogs, start: Date, end: Date, groupNames: string[]): Promise<string> {
    const query = `
            filter @type = "REPORT"
            | fields datefloor(@timestamp, 1d) as Date, @duration/1000 as DurationInS, @memorySize/1000000 as MemorySetInMB, ${MAX_WATTS} * DurationInS/3600 * MemorySetInMB/1792 as wattsPerFunction
            | stats sum(wattsPerFunction) as Watts by Date 
            | sort Date asc`

    const params = {
      startTime: start.getTime(),
      endTime: end.getTime(),
      queryString: query,
      logGroupNames: groupNames,
    }
    const queryData = await cw.startQuery(params).promise()
    return queryData.queryId
  }

  private async getResults(cw: AWS.CloudWatchLogs, queryId: string) {
    const params = {
      queryId: queryId,
    }
    let cwResultsData
    const startTime = Date.now()

    while (true) {
      cwResultsData = await cw.getQueryResults(params).promise()
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
    return getCostFromCostExplorer(params, region)
  }
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
