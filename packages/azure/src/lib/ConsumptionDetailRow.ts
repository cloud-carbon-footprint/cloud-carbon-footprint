/*
 * © 2021 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'

import {
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
  VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING,
} from './VirtualMachineTypes'
import { LegacyUsageDetail } from '@azure/arm-consumption/esm/models'
import { AZURE_REGIONS } from './AzureRegions'

export default class ConsumptionDetailRow extends BillingDataRow {
  constructor(usageDetail: LegacyUsageDetail) {
    const consumptionDetails = {
      cloudProvider: 'AZURE',
      accountId: usageDetail.subscriptionId,
      accountName: usageDetail.subscriptionName,
      timestamp: new Date(usageDetail.date),
      usageType: usageDetail.meterDetails.meterName,
      usageUnit: usageDetail.meterDetails.unitOfMeasure,
      usageAmount: usageDetail.quantity,
      serviceName: usageDetail.meterDetails.meterCategory,
      cost: usageDetail.cost,
      region: usageDetail.resourceLocation,
    }

    super(consumptionDetails)
    this.usageType = this.parseUsageType()
    this.vCpuHours = this.usageAmount * this.getVCpus()
    this.seriesName = this.getSeriesFromInstanceType()
    this.region = this.getRegionFromResourceLocation()
  }

  public getVCpus(): number {
    const seriesName = this.getSeriesFromInstanceType()
    return (
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName]?.[this.usageType]?.[0] ||
      VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING[this.usageType]?.[0] ||
      1
    )
  }

  private getRegionFromResourceLocation(): string {
    for (const region of Object.values(AZURE_REGIONS)) {
      if (region.name === this.region || region.options.includes(this.region)) {
        return region.name
      }
    }
    return AZURE_REGIONS.UNKNOWN.name
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
