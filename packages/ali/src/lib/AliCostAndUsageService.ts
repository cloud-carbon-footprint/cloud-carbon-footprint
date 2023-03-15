/*
 * © 2023 Thoughtworks, Inc.
 */

import {
  ComputeEstimator,
  EmbodiedEmissionsEstimator,
  MemoryEstimator,
  NetworkingEstimator,
  StorageEstimator,
  UnknownEstimator,
} from '@cloud-carbon-footprint/core'
import { ServiceWrapper } from '@cloud-carbon-footprint/aws'
import {
  configLoader,
  EstimationResult,
  GroupBy,
  Logger,
  ServiceData,
} from '@cloud-carbon-footprint/common'
import BssOpenApi20171214 from '@alicloud/bssopenapi20171214'
import * as $OpenApi from '@alicloud/openapi-client'
import * as $BssOpenApi20171214 from '@alicloud/bssopenapi20171214'
import moment from 'moment/moment'
import * as $Util from '@alicloud/tea-util'
import AliCalculateRow from './AliCalculateRow'

export default class AliCostAndUsageService {
  private readonly logger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly unknownEstimator: UnknownEstimator,
    private readonly embodiedEmissionsEstimator: EmbodiedEmissionsEstimator,
    private readonly serviceWrapper?: ServiceWrapper,
  ) {
    this.logger = new Logger('AliCostAndUsageService')
  }

  async getEstimates(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    this.logger.info(
      `startDate: ${start}, endDate: ${end}, grouping: ${grouping}`,
    )
    const result: EstimationResult[] = []
    const serviceEstimates: ServiceData[] = []
    const aliConfig = configLoader().ALI

    for (const date of this.getDates(start, end)) {
      const response = await this.getUsage(
        date,
        aliConfig.authentication.accessKeyId,
        aliConfig.authentication.accessKeySecret,
      )
      if (response.body.data.totalCount <= 0) break
      const row = new AliCalculateRow(response)
      this.logger.info(row.serviceName)
      response.body.data.items.forEach((cur) => {
        serviceEstimates.push({
          cloudProvider: 'ALI',
          accountName: cur.billAccountName,
          serviceName: cur.nickName,
          accountId: cur.billAccountID,
          // todo calculate
          kilowattHours: 0,
          co2e: 0,
          cost: 0,
          // todo chinese to english?
          region: cur.region,
          usesAverageCPUConstant: false,
        })
      })
      result.push({
        groupBy: grouping,
        timestamp: date,
        serviceEstimates,
      })
    }
    return result
  }

  getDates(startDate: Date, endDate: Date) {
    const dates = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
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
        billingCycle: moment(date).format('YYYY-MM'),
      })
    const runtime = new $Util.RuntimeOptions({})
    return await client.describeInstanceBillWithOptions(
      describeInstanceBillRequest,
      runtime,
    )
  }
}
