import { ResourceRecommendationBase } from '@azure/arm-advisor'

import { AZURE_REGIONS } from './AzureRegions'
import {
  VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING,
  VIRTUAL_MACHINE_TYPE_SERIES_MAPPING,
  VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING,
} from './VirtualMachineTypes'

export default class RightsizingRecommendation {
  public subscriptionId: string
  public region: string
  public type: string
  public instanceName: string
  public resourceId: string
  public instanceType: string
  public vCpuHours: number
  public costSavings: number
  public usageAmount: number

  protected constructor(init: Partial<ResourceRecommendationBase>) {
    Object.assign(this, init)
  }

  public parseInstanceType(): string {
    let parsedInstanceType
    if (this.instanceType.includes('Spot'))
      parsedInstanceType = this.instanceType.replace(' Spot', '')
    if (this.instanceType.includes('/'))
      parsedInstanceType = this.instanceType.split('/')[0]
    if (this.instanceType.includes('_')) {
      let instanceTypeSplit = this.instanceType.split('_')
      if (instanceTypeSplit[0].includes('Standard')) {
        instanceTypeSplit = instanceTypeSplit.slice(1)
      }
      parsedInstanceType = instanceTypeSplit.join(' ')
    }
    return parsedInstanceType
  }

  public getSeriesFromInstanceType(): string {
    let matchingSeriesName = ''
    for (const seriesName in VIRTUAL_MACHINE_TYPE_SERIES_MAPPING) {
      if (
        VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName].hasOwnProperty(
          this.instanceType,
        )
      ) {
        matchingSeriesName = seriesName
      }
    }
    return matchingSeriesName
  }

  public getVCpuHours(): number {
    const seriesName = this.getSeriesFromInstanceType()
    const vCpus =
      VIRTUAL_MACHINE_TYPE_SERIES_MAPPING[seriesName]?.[
        this.instanceType
      ]?.[0] ||
      VIRTUAL_MACHINE_TYPE_VCPU_MEMORY_MAPPING[this.instanceType]?.[0] ||
      VIRTUAL_MACHINE_TYPE_CONSTRAINED_VCPU_CAPABLE_MAPPING[
        this.instanceType
      ]?.[0] ||
      1

    return vCpus * this.usageAmount
  }

  public getMappedRegion(): string {
    for (const region of Object.values(AZURE_REGIONS)) {
      if (region.name === this.region || region.options.includes(this.region)) {
        return region.name
      }
    }
    return AZURE_REGIONS.UNKNOWN.name
  }
}
