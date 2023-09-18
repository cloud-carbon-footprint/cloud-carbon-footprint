/*
 * © 2023 Thoughtworks, Inc.
 */
import { mapToArabic } from '@cloud-carbon-footprint/common'
import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { DescribeInstanceBillResponseBodyDataItems } from '@alicloud/bssopenapi20171214/src/client'
import { ALI_REPLICATION_FACTORS_FOR_SERVICES } from './ReplicationFactors'

export default class AliCalculateRow extends BillingDataRow {
  readonly specificationFamily: string

  constructor(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    // const consumptionDetails = getConsumptionDetails(usageDetail)
    super({
      accountId: usageDetail.billAccountID,
      accountName: usageDetail.billAccountName,
      cost: usageDetail.cashAmount,
      region: usageDetail.region,
      serviceName: usageDetail.productCode,
    })

    // this.usageType = this.parseUsageType()
    this.seriesName = this.getSeriesName(usageDetail)
    this.instanceType = usageDetail.productCode
    this.vCpuHours = this.getVCpuHours(usageDetail)
    this.gpuHours = this.getGpuHours(usageDetail)
    this.replicationFactor = this.getReplicationFactor()
    this.cost = usageDetail.cashAmount
    this.accountName = usageDetail.billAccountName
    this.accountId = usageDetail.billAccountID
    this.usageAmount = this.getMemoryHours(usageDetail)
    this.specificationFamily = this.getSpecificationFamily()
  }

  private getSpecificationFamily() {
    const seriesNameArr = this.seriesName.split('.')
    if (seriesNameArr.length <= 1) {
      return seriesNameArr[0]
    }
    const second = seriesNameArr[1].split('-')[0]
    return seriesNameArr[0] + '.' + second
  }

  private getSeriesName(
    usageDetail: DescribeInstanceBillResponseBodyDataItems,
  ) {
    return usageDetail.instanceSpec
  }

  private getVCpuHours(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    if (this.serviceName == 'fc') {
      return this.getFunctionComputeVcpuHours(usageDetail.instanceConfig)
    }
    const instanceConfig = usageDetail.instanceConfig
    return (
      this.getUsage(usageDetail.servicePeriod, usageDetail.servicePeriodUnit) *
      this.parseCpuAndGpu(instanceConfig, 'CPU')
    )
  }

  private getFunctionComputeVcpuHours(instanceConfig: string) {
    const vcpuHoursStr = this.getJsonValue('vCPU资源包', instanceConfig)?.split(
      'vCPU*秒',
    )[0]
    if (vcpuHoursStr == undefined) {
      return 0
    }
    const resultArr = vcpuHoursStr.split(' ')
    if (resultArr.length <= 1) {
      return 0
    } else {
      const quantity = parseInt(resultArr[0])
      const unitValue = mapToArabic(resultArr[1])
      return (quantity * unitValue) / 3600
    }
  }

  private getMemoryHours(
    usageDetail: DescribeInstanceBillResponseBodyDataItems,
  ) {
    const instanceConfig = usageDetail.instanceConfig
    if (this.serviceName == 'fc') {
      return this.getFunctionComputeMemoryHours(instanceConfig)
    }

    return (
      this.getUsage(usageDetail.servicePeriod, usageDetail.servicePeriodUnit) *
      this.parseMemory(instanceConfig)
    )
  }

  private getFunctionComputeMemoryHours(instanceConfig: string) {
    const memoryHoursStr = this.getJsonValue(
      '内存资源包',
      instanceConfig,
    )?.split('GB*秒')[0]
    if (memoryHoursStr == undefined) {
      return 0
    }
    const resultArr = memoryHoursStr.split(' ')
    if (resultArr.length <= 1) {
      return 0
    } else {
      const quantity = parseInt(resultArr[0])
      const unitValue = mapToArabic(resultArr[1])
      return (quantity * unitValue) / 3600
    }
  }

  private getGpuHours(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    const instanceConfig = usageDetail.instanceConfig
    return (
      this.getUsage(usageDetail.servicePeriod, usageDetail.servicePeriodUnit) *
      this.parseCpuAndGpu(instanceConfig, 'GPU')
    )
  }

  private parseCpuAndGpu(instanceConfig: string, key: string): number {
    const keyValue = this.getJsonValue(key, instanceConfig)
    if (keyValue == null) {
      return 0
    }
    return parseInt(keyValue.split('核')[0])
  }

  private parseMemory(instanceConfig: string): number {
    const keyValue = this.getJsonValue('内存', instanceConfig)
    if (keyValue == null) {
      return 0
    }
    return parseInt(keyValue.split('GB')[0])
  }

  private getUsage(servicePeriod: string, servicePeriodUnit: string) {
    const servicePeriodUnitRatios: { [key: string]: number } = {
      秒: 1 / 3600,
      分: 1 / 60,
      时: 1,
      天: 24,
      月: 24 * 30,
      年: 24 * 30 * 12,
    }

    const ratio = servicePeriodUnitRatios[servicePeriodUnit] || 1
    return parseInt(servicePeriod) * ratio
  }

  public getJsonValue(key: string, jsonStr: string): string {
    const str = `(?<=(${key}):).*?(?=(;|$))`
    const regExp = new RegExp(str, 'g')
    const result = jsonStr.match(regExp)
    return result && result.length != 0 ? result[0] : null
  }

  private getReplicationFactor(): number {
    return (
      (ALI_REPLICATION_FACTORS_FOR_SERVICES[this.serviceName] &&
        ALI_REPLICATION_FACTORS_FOR_SERVICES[this.serviceName](
          this.usageType,
          this.region,
        )) ||
      ALI_REPLICATION_FACTORS_FOR_SERVICES.DEFAULT()
    )
  }
}
