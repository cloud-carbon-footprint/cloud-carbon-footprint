/*
 * © 2021 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'

import {
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
  VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING,
} from './VirtualMachineTypes'
import {
  LegacyUsageDetail,
  ModernUsageDetail,
} from '@azure/arm-consumption/esm/models'
import { AZURE_REGIONS } from './AzureRegions'

export default class ConsumptionDetailRow extends BillingDataRow {
  constructor(usageDetail: LegacyUsageDetail | ModernUsageDetail) {
    const consumptionDetails = getConsumptionDetails(usageDetail)
    super(consumptionDetails)

    this.usageType = this.parseUsageType()
    this.seriesName = this.getSeriesFromInstanceType()
    this.vCpuHours = this.usageAmount * this.getVCpus()
    this.region = this.getRegionFromResourceLocation()
  }

  public getVCpus(): number {
    return (
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[this.seriesName]?.[
        this.usageType
      ]?.[0] ||
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

  private getSeriesFromInstanceType(): string {
    let matchingSeriesName = ''
    for (const seriesName in VIRTUAL_MACHINE_TYPE_SERIES_MAPPING) {
      if (
        VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName].hasOwnProperty(
          this.usageType,
        )
      ) {
        matchingSeriesName = seriesName
      }
    }
    return matchingSeriesName
  }
}

const getConsumptionDetails = (
  usageDetail: LegacyUsageDetail | ModernUsageDetail,
) => {
  const consumptionDetails: Partial<BillingDataRow> = {
    cloudProvider: 'AZURE',
    accountName: usageDetail.subscriptionName,
    timestamp: new Date(usageDetail.date),
    usageAmount: usageDetail.quantity,
    region: usageDetail.resourceLocation,
  }

  if (usageDetail.kind === 'modern') {
    return {
      ...consumptionDetails,
      accountId: usageDetail.subscriptionGuid,
      usageType: usageDetail.meterName,
      usageUnit: usageDetail.unitOfMeasure,
      serviceName: usageDetail.meterCategory,
      cost: usageDetail.costInUSD,
    }
  } else {
    return {
      ...consumptionDetails,
      accountId: usageDetail.subscriptionId,
      usageType: usageDetail.meterDetails.meterName,
      usageUnit: usageDetail.meterDetails.unitOfMeasure,
      serviceName: usageDetail.meterDetails.meterCategory,
      cost: usageDetail.cost,
    }
  }
}
