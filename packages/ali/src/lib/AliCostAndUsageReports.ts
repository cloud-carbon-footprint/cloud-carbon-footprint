/*
 * © 2023 Thoughtworks, Inc.
 */

import { Logger } from '@cloud-carbon-footprint/common'
import BssOpenApi20171214 from '@alicloud/bssopenapi20171214'
import * as $OpenApi from '@alicloud/openapi-client'
import * as $BssOpenApi20171214 from '@alicloud/bssopenapi20171214'
import * as $Util from '@alicloud/tea-util'
import moment from 'moment'
import { MutableServiceEstimate } from '@cloud-carbon-footprint/core/src/FootprintEstimate'

export default class AliCostAndUsageReports {
  private readonly aliCostAndUsageReportsLogger: Logger

  constructor() {
    this.aliCostAndUsageReportsLogger = new Logger('aliCostAndUsageReports')
  }

  async getEstimates(date: Date): Promise<MutableServiceEstimate[]> {
    const results: MutableServiceEstimate[] = []

    const response = await this.getUsage(date, '', '')
    response.body.data.items.forEach((cur) => {
      results.push({
        cloudProvider: 'ALI',
        accountName: cur.billAccountName,
        serviceName: cur.nickName,
        kilowattHours: 0,
        co2e: 0,
        accountId: cur.billAccountID,
        cost: 0,
        region: cur.region,
        usesAverageCPUConstant: false,
      })
    })
    return results
  }

  createClient(
    accessKeyId: string,
    accessKeySecret: string,
  ): BssOpenApi20171214 {
    const config = new $OpenApi.Config({
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
    })
    config.endpoint = `business.aliyuncs.com`
    return new BssOpenApi20171214(config)
  }

  async getUsage(
    date: Date,
    accessKeyId: string,
    accessKeySecret: string,
  ): Promise<$BssOpenApi20171214.DescribeInstanceBillResponse> {
    const client = this.createClient(accessKeyId, accessKeySecret)
    const describeInstanceBillRequest =
      new $BssOpenApi20171214.DescribeInstanceBillRequest({
        billingCycle: moment(date).format('YYYY-MM-DD'),
      })
    const runtime = new $Util.RuntimeOptions({})
    return await client.describeInstanceBillWithOptions(
      describeInstanceBillRequest,
      runtime,
    )
  }
}
