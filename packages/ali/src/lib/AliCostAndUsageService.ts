/*
 * © 2023 Thoughtworks, Inc.
 */

import {
  accumulateKilowattHours,
  AccumulateKilowattHoursBy,
  CloudConstants,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  ComputeUsage,
  EmbodiedEmissionsEstimator,
  EmbodiedEmissionsUsage,
  FootprintEstimate,
  MemoryEstimator,
  MemoryUsage,
  NetworkingEstimator,
  NetworkingUsage,
  StorageEstimator,
  StorageUsage,
  UnknownEstimator,
  UnknownUsage,
} from '@cloud-carbon-footprint/core'
import {
  configLoader,
  containsAny,
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
  SPECIFICATION_FAMILY_COMPUTE_PROCESSOR_MAPPING,
  NETWORKING_USAGE_TYPES,
  UNKNOWN_SERVICES,
  UNKNOWN_USAGE_TYPES,
  SSD_MANAGED_DISKS_STORAGE_GB,
  STORAGE_USAGE_TYPES,
  HDD_MANAGED_DISKS_STORAGE_GB,
  INSTANCE_SPECIFICATION_MAPPING,
} from './AliTypes'

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

        const embodiedEmissions = this.getEmbodiedEmissions(
          row,
          emissionsFactors,
        )

        const storageFootprintEstimate = this.getStorageFootprintEstimate(
          row,
          pue,
          emissionsFactors,
        )

        const networkingFootprintEstimate = this.getNetworkingFootprintEstimate(
          row,
          pue,
          emissionsFactors,
        )

        const unknownFootprintEstimate = this.getEstimateForUnknownUsage(row)

        this.logger.info(
          'computeFootprintEstimate:' +
            JSON.stringify(computeFootprintEstimate),
        )
        this.logger.info(
          'memoryFootprintEstimate:' + JSON.stringify(memoryFootprintEstimate),
        )
        this.logger.info('row:' + JSON.stringify(row))
        serviceEstimates.push({
          cloudProvider: aliConfig.NAME,
          accountName: row.accountName,
          serviceName: row.serviceName,
          accountId: row.accountId,
          kilowattHours:
            computeFootprintEstimate.kilowattHours +
            memoryFootprintEstimate.kilowattHours +
            storageFootprintEstimate.kilowattHours +
            networkingFootprintEstimate.kilowattHours +
            unknownFootprintEstimate.kilowattHours +
            embodiedEmissions.kilowattHours,
          co2e:
            computeFootprintEstimate.co2e +
            memoryFootprintEstimate.co2e +
            storageFootprintEstimate.co2e +
            networkingFootprintEstimate.co2e +
            unknownFootprintEstimate.co2e +
            embodiedEmissions.co2e,
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
    const processors = this.getComputeProcessorsFromAliSpecificationFamily(
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
      cpuUtilizationAverage: ALI_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: row.gpuHours,
      usesAverageCPUConstant: true,
    }

    const gpuComputeConstants: CloudConstants = {
      minWatts: ALI_CLOUD_CONSTANTS.getMinWatts(gpuComputeProcessors),
      maxWatts: ALI_CLOUD_CONSTANTS.getMaxWatts(gpuComputeProcessors),
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

  private getComputeProcessorsFromAliSpecificationFamily(
    specificationFamily: string,
  ) {
    return (
      SPECIFICATION_FAMILY_COMPUTE_PROCESSOR_MAPPING[specificationFamily] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private isGpuUsage(gpuHours: number) {
    return gpuHours != 0
  }

  private getGPUComputeProcessorsFromAliInstanceType(
    specificationFamily: string,
  ) {
    return (
      GPU_VIRTUAL_MACHINE_TYPE_PROCESSOR_MAPPING[specificationFamily] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private getEmbodiedEmissions(
    row: AliCalculateRow,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { instancevCpu, scopeThreeEmissions, largestInstancevCpu } =
      this.getDataFromSeriesName(row.seriesName)

    if (!instancevCpu || !scopeThreeEmissions || !largestInstancevCpu)
      return {
        timestamp: new Date(),
        kilowattHours: 0,
        co2e: 0,
      }

    const embodiedEmissionsUsage: EmbodiedEmissionsUsage = {
      instancevCpu,
      largestInstancevCpu,
      usageTimePeriod: row.usageAmount / instancevCpu,
      scopeThreeEmissions,
    }

    return this.embodiedEmissionsEstimator.estimate(
      [embodiedEmissionsUsage],
      row.region,
      emissionsFactors,
    )[0]
  }

  private getDataFromSeriesName(seriesName: string) {
    const instanceTypeDetails = seriesName.split('.')
    if (instanceTypeDetails.length <= 1) {
      return {
        instancevCpu: 0,
        scopeThreeEmissions: 0,
        largestInstancevCpu: 0,
      }
    }
    const instanceSize = instanceTypeDetails[instanceTypeDetails.length - 1]
    const instanceFamily = instanceTypeDetails.slice(0, 2).join('.')

    const instancevCpu =
      INSTANCE_SPECIFICATION_MAPPING[instanceFamily]?.[instanceSize]?.[0]

    const scopeThreeEmissions =
      INSTANCE_SPECIFICATION_MAPPING[instanceFamily]?.[instanceSize]?.[2]
    const familyInstanceTypes: number[][] = Object.values(
      INSTANCE_SPECIFICATION_MAPPING[instanceFamily] || {},
    )

    const [largestInstancevCpu] =
      familyInstanceTypes[familyInstanceTypes.length - 1] || []

    return {
      instancevCpu,
      scopeThreeEmissions,
      largestInstancevCpu,
    }
  }

  private getStorageFootprintEstimate(
    row: AliCalculateRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ) {
    const storageUsage: StorageUsage = {
      timestamp: row.timestamp,
      terabyteHours: row.usageAmount,
    }

    const storageConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: row.replicationFactor,
    }

    let estimate: FootprintEstimate = {
      timestamp: undefined,
      kilowattHours: 0,
      co2e: 0,
    }
    if (this.isSSDStorage(row))
      estimate = this.ssdStorageEstimator.estimate(
        [storageUsage],
        row.region,
        emissionsFactors,
        storageConstants,
      )[0]
    else if (this.isHDDStorage(row))
      estimate = this.hddStorageEstimator.estimate(
        [storageUsage],
        row.region,
        emissionsFactors,
        storageConstants,
      )[0]
    if (estimate) {
      estimate.usesAverageCPUConstant = false
      accumulateKilowattHours(
        ALI_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        row,
        estimate.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
      )
    }
    return estimate
  }

  private getNetworkingFootprintEstimate(
    consumptionDetailRow: AliCalculateRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    let networkingEstimate: FootprintEstimate = {
      timestamp: undefined,
      kilowattHours: 0,
      co2e: 0,
    }
    if (containsAny(NETWORKING_USAGE_TYPES, consumptionDetailRow.usageType)) {
      const networkingUsage: NetworkingUsage = {
        timestamp: consumptionDetailRow.timestamp,
        gigabytes: consumptionDetailRow.usageAmount,
      }

      const networkingConstants: CloudConstants = {
        powerUsageEffectiveness: powerUsageEffectiveness,
      }

      networkingEstimate = this.networkingEstimator.estimate(
        [networkingUsage],
        consumptionDetailRow.region,
        emissionsFactors,
        networkingConstants,
      )[0]
    }
    if (networkingEstimate) {
      networkingEstimate.usesAverageCPUConstant = false
      accumulateKilowattHours(
        ALI_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        consumptionDetailRow,
        networkingEstimate.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
      )
    }
    return networkingEstimate
  }

  private getEstimateForUnknownUsage(
    rowData: AliCalculateRow,
  ): FootprintEstimate {
    if (
      containsAny(UNKNOWN_SERVICES, rowData.serviceName) ||
      containsAny(UNKNOWN_USAGE_TYPES, rowData.usageType)
    ) {
      const unknownUsage: UnknownUsage = {
        timestamp: rowData.timestamp,
        usageAmount: rowData.usageAmount,
        usageUnit: rowData.usageUnit,
      }

      const unknownConstants: CloudConstants = {
        kilowattHoursByServiceAndUsageUnit:
          ALI_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
      }
      return this.unknownEstimator.estimate(
        [unknownUsage],
        rowData.region,
        ALI_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        unknownConstants,
      )[0]
    }
    return {
      timestamp: rowData.timestamp,
      kilowattHours: 0,
      co2e: 0,
      usesAverageCPUConstant: false,
    }
  }

  private isSSDStorage(row: AliCalculateRow): boolean {
    return (
      containsAny(Object.keys(SSD_MANAGED_DISKS_STORAGE_GB), row.usageType) ||
      containsAny(STORAGE_USAGE_TYPES, row.usageType)
    )
  }

  private isHDDStorage(row: AliCalculateRow): boolean {
    return containsAny(Object.keys(HDD_MANAGED_DISKS_STORAGE_GB), row.usageType)
  }
}
