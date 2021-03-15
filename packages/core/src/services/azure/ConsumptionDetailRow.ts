/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import BillingDataRow from '../../domain/BillingDataRow'
import { UsageDetail } from '@azure/arm-consumption/esm/models'
import { VIRTUAL_MACHINE_TYPE_VCPU_MAPPING } from './VirtualMachineTypes'

export default class ConsumptionDetailRow extends BillingDataRow {
  constructor(usageDetail: UsageDetail) {
    const consumptionDetails = {
      cloudProvider: 'AZURE',
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
  }

  private getVCpus(): number {
    return VIRTUAL_MACHINE_TYPE_VCPU_MAPPING[this.usageType]
  }

  private parseUsageType(): string {
    if (this.usageType.includes('Spot'))
      return this.usageType.replace(' Spot', '')
    if (this.usageType.includes('/')) return this.usageType.split('/')[0]
    return this.usageType
  }
}
