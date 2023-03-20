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
  MemoryUsage,
  NetworkingEstimator,
  StorageEstimator,
  UnknownEstimator,
} from '@cloud-carbon-footprint/core'
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
import {
  GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
} from './AliTypes'
import { AZURE_CLOUD_CONSTANTS } from '@cloud-carbon-footprint/azure'

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
  ) {
    this.logger = new Logger('AliCostAndUsageService')
  }

  async getEstimates(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    const result: EstimationResult[] = []
    const aliConfig = configLoader().ALI
    const emissionsFactors: CloudConstantsEmissionsFactors =
      ALI_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
    for (const date of this.getDates(start, end)) {
      const serviceEstimates: ServiceData[] = []
      const response = await this.getUsage(
        date,
        aliConfig.authentication.accessKeyId,
        aliConfig.authentication.accessKeySecret,
      )
      this.logger.info('response:' + JSON.stringify(response))
      if (response.body.data.totalCount <= 0) continue
      response.body.data.items.forEach((cur) => {
        const row = new AliCalculateRow(cur)
        const pue = ALI_CLOUD_CONSTANTS.getPUE()
        const computeFootprintEstimate = this.getComputeFootprintEstimate(
          row,
          pue,
          emissionsFactors,
        )

        const memoryFootprintEstimate = this.getMemoryFootprintEstimate(
          row,
          pue,
          emissionsFactors,
        )

        this.logger.info('row:' + JSON.stringify(row))
        serviceEstimates.push({
          cloudProvider: 'AliCloud',
          accountName: row.accountName,
          serviceName: row.serviceName,
          accountId: row.accountId,
          kilowattHours:
            computeFootprintEstimate.kilowattHours +
            memoryFootprintEstimate.kilowattHours,
          co2e: computeFootprintEstimate.co2e + memoryFootprintEstimate.co2e,
          cost: row.cost,
          region: row.region,
          usesAverageCPUConstant: false,
        })
      })
      this.logger.info('serviceEstimates:' + JSON.stringify(serviceEstimates))
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
    this.logger.info('request:' + JSON.stringify(describeInstanceBillRequest))
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
      row.specificationFamily,
    )
    const cpuComputeConstants: CloudConstants = {
      minWatts: ALI_CLOUD_CONSTANTS.getMinWatts(processors),
      maxWatts: ALI_CLOUD_CONSTANTS.getMaxWatts(processors),
      powerUsageEffectiveness: pue,
      replicationFactor: row.replicationFactor,
    }
    const computeFootprintEstimate = this.computeEstimator.estimate(
      [computeUsage],
      row.region,
      emissionsFactors,
      cpuComputeConstants,
    )[0]

    if (this.isGpuUsage(row.gpuHours)) {
      return this.appendGpuComputeEstimate(
        row,
        pue,
        emissionsFactors,
        computeFootprintEstimate,
      )
    }
    return computeFootprintEstimate
  }

  private appendGpuComputeEstimate(
    row: AliCalculateRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
    computeFootprintEstimate: FootprintEstimate,
  ) {
    const gpuComputeProcessors =
      this.getGPUComputeProcessorsFromAliInstanceType(row.specificationFamily)

    const gpuComputeUsage: ComputeUsage = {
      timestamp: row.timestamp,
      cpuUtilizationAverage: AZURE_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: row.gpuHours,
      usesAverageCPUConstant: true,
    }

    const gpuComputeConstants: CloudConstants = {
      minWatts: AZURE_CLOUD_CONSTANTS.getMinWatts(gpuComputeProcessors),
      maxWatts: AZURE_CLOUD_CONSTANTS.getMaxWatts(gpuComputeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: row.replicationFactor,
    }

    const gpuComputeFootprintEstimate = this.computeEstimator.estimate(
      [gpuComputeUsage],
      row.region,
      emissionsFactors,
      gpuComputeConstants,
    )[0]

    computeFootprintEstimate.kilowattHours +=
      gpuComputeFootprintEstimate.kilowattHours
    computeFootprintEstimate.co2e += gpuComputeFootprintEstimate.co2e
    return computeFootprintEstimate
  }

  private getMemoryFootprintEstimate(
    consumptionDetailRow: AliCalculateRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const usage: MemoryUsage = {
      timestamp: consumptionDetailRow.timestamp,
      gigabyteHours: consumptionDetailRow.usageAmount,
    }

    const memoryConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: consumptionDetailRow.replicationFactor,
    }

    const memoryEstimate = this.memoryEstimator.estimate(
      [usage],
      consumptionDetailRow.region,
      emissionsFactors,
      memoryConstants,
    )[0]

    memoryEstimate.usesAverageCPUConstant = false

    return memoryEstimate
  }

  private getComputeProcessorsFromAliInstanceType(instanceType: string) {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private isGpuUsage(gpuHours: number) {
    return gpuHours != 0
  }

  private getGPUComputeProcessorsFromAliInstanceType(instanceType: string) {
    return (
      GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING[instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }
}
