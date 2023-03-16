/*
 * © 2023 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { DescribeInstanceBillResponseBodyDataItems } from '@alicloud/bssopenapi20171214/src/client'
import { ALI_REPLICATION_FACTORS_FOR_SERVICES } from './ReplicationFactors'

export default class AliCalculateRow extends BillingDataRow {
  constructor(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    // const consumptionDetails = getConsumptionDetails(usageDetail)
    super({})

    // this.usageType = this.parseUsageType()
    this.serviceName = usageDetail.productCode
    this.seriesName = this.getSeriesName(usageDetail)
    this.vCpuHours = this.getVCpuHours(usageDetail)
    this.gpuHours = this.getGpuHours(usageDetail)
    this.region = usageDetail.region
    this.replicationFactor = this.getReplicationFactor()
    this.cost = usageDetail.cashAmount
    this.accountName = usageDetail.billAccountName
    this.accountId = usageDetail.billAccountID
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

  private getGpuHours(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    const instanceConfig = usageDetail.instanceConfig
    return this.getUsage() * this.parseCpuAndGpu(instanceConfig, 'GPU')
  }

  private parseCpuAndGpu(instanceConfig: string, key: string): number {
    const keyValue = this.getJsonValue(key, instanceConfig)
    if (keyValue == null) {
      return 1
    }
    return parseInt(keyValue.split('核')[0])
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
