/*
 * © 2021 Thoughtworks, Inc.
 */

import { OnPremiseDataInput } from '@cloud-carbon-footprint/common'
import {
  INTEL_COMPUTE_PROCESSOR_FAMILY_MAPPING,
  AMD_COMPUTE_PROCESSOR_FAMILY_MAPPING,
} from './MachineTypes'
import OnPremiseBillingDataRow from './OnPremiseBillingDataRow'

export default class OnPremiseDataReportRow extends OnPremiseBillingDataRow {
  constructor(usageData: OnPremiseDataInput) {
    super(usageData)

    this.cpuDescription = usageData.cpuDescription
    this.machineName = usageData.machineName
    this.memory = usageData.memory
    this.machineType = usageData.machineType
    this.processorFamilies = this.getProcessorFamilyFromCpuDescription(
      usageData.cpuDescription,
    )
    this.upTime = {
      daily: usageData.dailyUptime,
      weekly: usageData.weeklyUptime,
      monthly: usageData.monthlyUptime,
      annual: usageData.annualUptime,
    }
    this.startTime = usageData.startTime
    this.endTime = usageData.endTime
    this.region = this.getRegionData(usageData.country, usageData.region)
    this.cpuUtilization = usageData.cpuUtilization
    this.powerUsageEffectiveness = usageData.powerUsageEffectiveness
  }

  public getProcessorFamilyFromCpuDescription(
    cpuDescription: string,
  ): string[] {
    let processor
    if (cpuDescription.includes('Intel')) {
      const replacedCpuDescription = cpuDescription.replace('Intel(R) ', '')
      const cpuDescriptionSubString = replacedCpuDescription.substring(
        replacedCpuDescription.indexOf(')') + 2,
        replacedCpuDescription.lastIndexOf(' @'),
      )
      processor = cpuDescriptionSubString.split('CPU').join('').trim()
    } else if (cpuDescription.includes('AMD')) {
      processor = cpuDescription.split(' ')[2]
    }
    return (
      INTEL_COMPUTE_PROCESSOR_FAMILY_MAPPING[processor] ||
      AMD_COMPUTE_PROCESSOR_FAMILY_MAPPING[processor] ||
      []
    )
  }

  public getRegionData(country: string, region: string): string {
    if (region && country === 'United States') return `${country}-${region}`
    return country
  }
}
