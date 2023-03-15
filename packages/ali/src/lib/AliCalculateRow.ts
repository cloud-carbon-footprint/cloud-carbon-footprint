/*
 * © 2023 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { configLoader } from '@cloud-carbon-footprint/common'
import { DescribeInstanceBillResponse } from '@alicloud/bssopenapi20171214'

export default class AliCalculateRow extends BillingDataRow {
  constructor(usageDetail: DescribeInstanceBillResponse) {
    // const consumptionDetails = getConsumptionDetails(usageDetail)
    super({})

    // this.usageType = this.parseUsageType()
    // this.seriesName = this.getSeriesFromInstanceType()
    // this.vCpuHours = this.usageAmount * this.getVCpus()
    // this.gpuHours = this.usageAmount * this.getGpus()
    // this.region = this.getRegionFromResourceLocation()

    this.tags = {}

    const tagNames = configLoader()?.AZURE?.RESOURCE_TAG_NAMES ?? []

    for (const resourceTagName of tagNames) {
      if (usageDetail?.tags?.[resourceTagName]) {
        this.tags[resourceTagName] = usageDetail.tags[resourceTagName]
      }
    }

    // if (tagNames.includes(RESOURCE_GROUP_TAG_NAME)) {
    //   this.tags.resourceGroup = usageDetail.properties.resourceGroup
    // }
  }
}
