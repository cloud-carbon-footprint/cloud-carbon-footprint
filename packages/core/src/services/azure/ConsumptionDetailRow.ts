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
    this.vCpuHours = this.usageAmount * this.getVCpuHours(this.usageType)
  }

  private getVCpuHours(usageType: string): number {
    return VIRTUAL_MACHINE_TYPE_VCPU_MAPPING[usageType.split('/')[0]]
  }
}
