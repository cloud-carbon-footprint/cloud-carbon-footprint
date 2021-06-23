/*
 * © 2021 ThoughtWorks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { UsageDetail } from '@azure/arm-consumption/esm/models'

import {
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
  VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING,
} from './VirtualMachineTypes'

export default class ConsumptionDetailRow extends BillingDataRow {
  constructor(usageDetail: UsageDetail) {
    const consumptionDetails = {
      cloudProvider: 'AZURE',
      accountId: usageDetail.subscriptionGuid,
      accountName: usageDetail.subscriptionName,
      timestamp: new Date(usageDetail.usageStart),
      usageType: usageDetail.meterDetails.meterName,
      usageUnit: usageDetail.meterDetails.unit,
      usageAmount: usageDetail.usageQuantity,
      serviceName: usageDetail.meterDetails.serviceName,
      cost: usageDetail.pretaxCost,
      region: usageDetail.location,
    }
    super(consumptionDetails)
    this.usageType = this.parseUsageType()
    this.vCpuHours = this.usageAmount * this.getVCpus()
    this.seriesName = this.getSeriesFromInstanceType()
  }

  public getVCpus(): number {
    const seriesName = this.getSeriesFromInstanceType()
    return (
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName]?.[this.usageType]?.[0] ||
      VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING[this.usageType]?.[0] ||
      1
    )
  }

  private parseUsageType(): string {
    if (this.usageType.includes('Spot'))
      return this.usageType.replace(' Spot', '')
    if (this.usageType.includes('/')) return this.usageType.split('/')[0]
    return this.usageType
  }

  private getSeriesFromInstanceType() {
    for (const seriesName in VIRTUAL_MACHINE_TYPE_SERIES_MAPPING) {
      if (
        VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName].hasOwnProperty(
          this.usageType,
        )
      ) {
        return seriesName
      }
    }
  }
}
