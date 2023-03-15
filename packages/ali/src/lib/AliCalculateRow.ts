/*
 * © 2023 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { DescribeInstanceBillResponseBodyDataItems } from '@alicloud/bssopenapi20171214/src/client'

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
  }

  private getSeriesName(
    usageDetail: DescribeInstanceBillResponseBodyDataItems,
  ) {
    return usageDetail.instanceSpec
  }

  private getVCpuHours(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    const instanceConfig = usageDetail.instanceConfig
    return (
      this.getUsage() *
      parseInt(this.getJsonValue('CPU', instanceConfig).split('核')[0])
    )
  }

  private getGpuHours(usageDetail: DescribeInstanceBillResponseBodyDataItems) {
    const instanceConfig = usageDetail.instanceConfig
    const gpuStr = this.getJsonValue('GPU', instanceConfig)
    return (
      this.getUsage() * parseInt(gpuStr == null ? '0' : gpuStr.split('核')[0])
    )
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
}
