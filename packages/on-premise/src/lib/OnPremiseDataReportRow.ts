/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { OnPremiseDataInput } from '@cloud-carbon-footprint/common'
import {
  INTEL_COMPUTE_PROCESSOR_FAMILY_MAPPING,
  AMD_COMPUTE_PROCESSOR_FAMILY_MAPPING,
} from './MachineTypes'
import OnPremiseBillingDataRow from './OnPremiseBillingDataRow'

export default class OnPremiseDataReportRow extends OnPremiseBillingDataRow {
  constructor(usageData: OnPremiseDataInput) {
    super(usageData)

    this.memory = usageData.memory
    this.machineType = usageData.machineType
    this.processorFamilies = this.getProcessorFamilyFromCpuId(
      usageData.machineName,
    )
    this.usageHours = this.getUsageHoursFromTimestamps(
      usageData.startTime,
      usageData.endTime,
    )
    this.region = this.getRegionData(usageData.country, usageData.region)
    this.cpuUtilization = usageData.cpuUtilization
    this.powerUsageEffectiveness = usageData.powerUsageEffectiveness
  }

  public getProcessorFamilyFromCpuId(cpuId: string): string[] {
    let processor
    if (cpuId.includes('Intel')) {
      const replacedCpuId = cpuId.replace('Intel(R) ', '')
      const cpuIdSubString = replacedCpuId.substring(
        replacedCpuId.indexOf(')') + 2,
        replacedCpuId.lastIndexOf(' @'),
      )
      processor = cpuIdSubString.split('CPU').join('').trim()
    } else if (cpuId.includes('AMD')) {
      processor = cpuId.split(' ')[2]
    }
    return (
      INTEL_COMPUTE_PROCESSOR_FAMILY_MAPPING[processor] ||
      AMD_COMPUTE_PROCESSOR_FAMILY_MAPPING[processor] ||
      []
    )
  }

  public getUsageHoursFromTimestamps(start: Date, end: Date): number {
    const startTime = moment(start)
    const endTime = moment(end)
    return endTime.diff(startTime, 'hours')
  }

  public getRegionData(country: string, region: string): string {
    if (region && country === 'United States') return `${country}-${region}`
    return country
  }
}
