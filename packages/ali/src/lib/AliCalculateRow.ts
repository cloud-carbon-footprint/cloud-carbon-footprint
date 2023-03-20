/*
 * © 2023 Thoughtworks, Inc.
 */

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
    this.specificationFamily = this.seriesName.split('.').slice(0, 2).join('.')
  }

  private getSeriesName(
    usageDetail: DescribeInstanceBillResponseBodyDataItems,
  ) {
    return usageDetail.instanceSpec
  }

  private getVCpuHours(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    const instanceConfig = usageDetail.instanceConfig
    return this.getUsage() * this.parseCpuAndGpu(instanceConfig, 'CPU')
  }

  private getMemoryHours(
    usageDetail: DescribeInstanceBillResponseBodyDataItems,
  ) {
    const instanceConfig = usageDetail.instanceConfig
    return this.getUsage() * this.parseMemory(instanceConfig)
  }

  private getGpuHours(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    const instanceConfig = usageDetail.instanceConfig
    return this.getUsage() * this.parseCpuAndGpu(instanceConfig, 'GPU')
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
      return 1
    }
    return parseInt(keyValue.split('GB')[0])
  }

  private getUsage() {
    return 30 * 24
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
