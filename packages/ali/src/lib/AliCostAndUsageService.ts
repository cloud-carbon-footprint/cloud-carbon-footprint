/*
 * © 2023 Thoughtworks, Inc.
 */

import {
  CloudConstants,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  ComputeUsage,
  EmbodiedEmissionsEstimator,
  FootprintEstimate,
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
import BssOpenApi20171214, * as $BssOpenApi20171214 from '@alicloud/bssopenapi20171214'
import * as $OpenApi from '@alicloud/openapi-client'
import moment from 'moment/moment'
import * as $Util from '@alicloud/tea-util'
import AliCalculateRow from './AliCalculateRow'
import {
  ALI_CLOUD_CONSTANTS,
  ALI_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING } from './AliTypes'

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
    const emissionsFactors: CloudConstantsEmissionsFactors =
      ALI_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
    for (const date of this.getDates(start, end)) {
      const response = await this.getUsage(
        date,
        aliConfig.authentication.accessKeyId,
        aliConfig.authentication.accessKeySecret,
      )
      if (response.body.data.totalCount <= 0) break
      response.body.data.items.forEach((cur) => {
        const row = new AliCalculateRow(cur)
        const pue = ALI_CLOUD_CONSTANTS.getPUE()
        const computeFootprintEstimate = this.getComputeFootprintEstimate(
          row,
          pue,
          emissionsFactors,
        )

        serviceEstimates.push({
          cloudProvider: 'ALI',
          accountName: cur.billAccountName,
          serviceName: cur.nickName,
          accountId: cur.billAccountID,
          // todo calculate
          kilowattHours: computeFootprintEstimate.kilowattHours,
          co2e: computeFootprintEstimate.co2e,
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
      currentDate.setMonth(currentDate.getMonth() + 1)
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

  private getComputeFootprintEstimate(
    row: AliCalculateRow,
    pue: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const computeUsage: ComputeUsage = {
      timestamp: row.timestamp,
      cpuUtilizationAverage: ALI_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: row.vCpuHours,
      usesAverageCPUConstant: true,
    }
    const processors = this.getComputeProcessorsFromAliInstanceType(
      row.instanceType,
    )
    const cpuComputeConstants: CloudConstants = {
      minWatts: ALI_CLOUD_CONSTANTS.getMinWatts(processors),
      maxWatts: ALI_CLOUD_CONSTANTS.getMaxWatts(processors),
      powerUsageEffectiveness: pue,
      replicationFactor: this.getReplicationFactor(row),
    }
    return this.computeEstimator.estimate(
      [computeUsage],
      row.region,
      emissionsFactors,
      cpuComputeConstants,
    )[0]
  }

  private getComputeProcessorsFromAliInstanceType(instanceType: string) {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private getReplicationFactor(row: AliCalculateRow) {
    this.logger.info('getReplicationFactor' + row)
    return 0
  }
}
