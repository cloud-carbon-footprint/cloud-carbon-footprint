/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { Athena } from 'aws-sdk'
import { EC2_INSTANCE_TYPES, MSK_INSTANCE_TYPES } from '@services/aws/AWSInstanceTypes'
import { PRICING_UNITS } from '@services/aws/CostAndUsageTypes'
import BillingDataRow from '@domain/BillingDataRow'

const GLUE_VCPUS_PER_USAGE = 4

export default class CostAndUsageReportsRow extends BillingDataRow {
  constructor(usageRowsHeader: Athena.Row, rowData: Athena.datumList) {
    const billingDataRowKeys = usageRowsHeader.Data.map((column) => Object.values(column)).flat()
    const billingDataRowValues = rowData.map((column) => Object.values(column)).flat()
    const billingDataRow = Object.fromEntries(
      billingDataRowKeys.map((_, i) => [billingDataRowKeys[i], billingDataRowValues[i]]),
    )
    super(billingDataRow)

    this.vCpuHours = this.getVCpuHours(this.usageAmount, this.serviceName, Number(this.vCpus))
    this.usageUnit = this.getUsageUnit()
    this.timestamp = new Date(this.timestamp)
    this.cost = Number(this.cost)
    this.cloudProvider = 'AWS'
  }

  private getUsageUnit() {
    if (this.usageType.includes('Fargate-GB-Hours')) return PRICING_UNITS.GB_HOURS
    return this.usageUnit
  }

  private getVCpuHours(usageAmount: number, serviceName: string, vCpuFromReport: number) {
    // When the service is AWS Glue, 4 virtual CPUs are provisioned (from AWS Docs).
    if (serviceName === 'AWSGlue') return GLUE_VCPUS_PER_USAGE * usageAmount
    if (this.includesAny(['Fargate-vCPU-Hours', 'vCPU-Hours', 'CPUCredits'], this.usageType)) return usageAmount
    if (!vCpuFromReport) return this.extractVCpuFromInstanceType() * usageAmount
    return vCpuFromReport * usageAmount
  }

  private extractVCpuFromInstanceType() {
    if (this.usageType.includes('Kafka')) return MSK_INSTANCE_TYPES[`Kafka${this.usageType.split('Kafka').pop()}`]
    return EC2_INSTANCE_TYPES[this.usageType.split(':').pop()]
  }

  private includesAny(substrings: string[], usageType: string) {
    return substrings.some((substring) => usageType.includes(substring))
  }
}
