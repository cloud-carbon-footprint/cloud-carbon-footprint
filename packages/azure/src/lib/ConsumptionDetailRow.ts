/*
 * © 2021 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'

import {
  GPU_VIRTUAL_MACHINE_TYPES,
  VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING,
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
  VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING,
} from './VirtualMachineTypes'
import { AZURE_REGIONS } from './AzureRegions'
import { UsageDetailResult } from './ConsumptionTypes'
import { configLoader, Logger } from '@cloud-carbon-footprint/common'

const RESOURCE_GROUP_TAG_NAME = 'resourceGroup'

const unknownAzureRegions: string[] = []

export default class ConsumptionDetailRow extends BillingDataRow {
  constructor(usageDetail: UsageDetailResult) {
    const consumptionDetails = getConsumptionDetails(usageDetail)
    super(consumptionDetails)

    this.usageType = this.parseUsageType()
    this.seriesName = this.getSeriesFromInstanceType()
    this.vCpuHours = this.usageAmount * this.getVCpus()
    this.gpuHours = this.usageAmount * this.getGpus()
    this.region = this.getRegionFromResourceLocation()

    this.tags = {}

    const tagNames = configLoader()?.AZURE?.RESOURCE_TAG_NAMES ?? []

    for (const resourceTagName of tagNames) {
      if (usageDetail?.tags?.[resourceTagName]) {
        this.tags[resourceTagName] = usageDetail.tags[resourceTagName]
      }
    }

    if (tagNames.includes(RESOURCE_GROUP_TAG_NAME)) {
      this.tags.resourceGroup = usageDetail.resourceGroup
    }
  }

  public getVCpus(): number {
    return (
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[this.seriesName]?.[
        this.usageType
      ]?.[0] ||
      VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING[this.usageType]?.[0] ||
      VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING[
        this.usageType
      ]?.[0] ||
      1
    )
  }

  private getGpus(): number {
    return GPU_VIRTUAL_MACHINE_TYPES[this.usageType] || 1
  }

  private getRegionFromResourceLocation(): string {
    for (const region of Object.values(AZURE_REGIONS)) {
      if (region.name === this.region || region.options.includes(this.region)) {
        return region.name
      }
    }

    if (!unknownAzureRegions.includes(this.region)) {
      new Logger('AzureRegions').warn(
        `Found unknown azure region '${this.region}', please add it to the AzureRegions.ts file and submit a PR, thank you!`,
      )
      unknownAzureRegions.push(this.region)
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

const getConsumptionDetails = (usageDetail: UsageDetailResult) => {
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
      accountId: usageDetail.id,
      usageType: usageDetail.meterDetails.meterName,
      usageUnit: usageDetail.meterDetails.unitOfMeasure,
      serviceName: usageDetail.meterDetails.meterCategory,
      cost: usageDetail.cost,
    }
  }
}
