import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import { estimateCo2 } from '@domain/FootprintEstimationConstants'
import AWS from 'aws-sdk'
import Cost from '@domain/Cost'

export default class Lambda implements ICloudService {
  serviceName: 'lambda'

  async getEstimates(start: Date, end: Date, region: string): Promise<FootprintEstimate[]> {
    const cloudWatchLogs = new AWS.CloudWatchLogs()
    const groupNames = await this.getLambdaLogGroupNames(cloudWatchLogs)
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

  async getCosts(/* start: Date, end: Date, region: string */): Promise<Cost[]> {
    return []
  }

  private async getLambdaLogGroupNames(cw: AWS.CloudWatchLogs): Promise<string[]> {
    const params = {
      logGroupNamePrefix: '/aws/lambda',
    }

    const data = await cw.describeLogGroups(params).promise()
    return data.logGroups.map(({ logGroupName }) => logGroupName)
  }

  private async runQuery(cw: AWS.CloudWatchLogs, start: Date, end: Date, groupNames: string[]): Promise<string> {
    const query = `
            filter @type = "REPORT"
            | fields datefloor(@timestamp, 1d) as Date, @duration/1000 as DurationInS, @memorySize/1000000 as MemorySetInMB, 2.35 * DurationInS/3600 * MemorySetInMB/1792 as wattsPerFunction
            | stats sum(wattsPerFunction) as Watts by Date 
            | sort Date asc`

    const params = {
      startTime: start.getTime() /* required */,
      endTime: end.getTime() /* required */,
      queryString: query /* required */,
      logGroupNames: groupNames,
    }
    const data = await cw.startQuery(params).promise()
    return data.queryId
  }

  private async getResults(cw: AWS.CloudWatchLogs, queryId: string) {
    const params = {
      queryId: queryId /* required */,
    }
    let status = ''
    let data
    while (status !== 'Complete') {
      await wait(1000)
      data = await cw.getQueryResults(params).promise()
      status = data.status
    }
    return data
  }
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
