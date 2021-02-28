/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { Athena } from 'aws-sdk'
import {
  BURSTABLE_INSTANCE_BASELINE_UTILIZATION,
  EC2_INSTANCE_TYPES,
  MSK_INSTANCE_TYPES,
  REDSHIFT_INSTANCE_TYPES,
} from '@services/aws/AWSInstanceTypes'
import { PRICING_UNITS } from '@services/aws/CostAndUsageTypes'
import BillingDataRow from '@domain/BillingDataRow'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'

const GLUE_VCPUS_PER_USAGE = 4

export default class CostAndUsageReportsRow extends BillingDataRow {
  constructor(usageRowsHeader: Athena.Row, rowData: Athena.datumList) {
    const billingDataRowKeys = usageRowsHeader.Data.map((column) => Object.values(column)).flat()
    const billingDataRowValues = rowData.map((column) => Object.values(column)).flat()
    const billingDataRow = Object.fromEntries(
      billingDataRowKeys.map((_, i) => [billingDataRowKeys[i], billingDataRowValues[i]]),
    )
    super(billingDataRow)

    this.vCpuHours = this.getVCpuHours(Number(this.vCpus))
    this.usageUnit = this.getUsageUnit()
    this.timestamp = new Date(this.timestamp)
    this.cost = Number(this.cost)
    this.cloudProvider = 'AWS'
  }

  private getUsageUnit(): string {
    if (this.usageType.includes('Fargate-GB-Hours')) return PRICING_UNITS.GB_HOURS
    if (this.serviceName === 'AmazonRedshift' && this.usageUnit === PRICING_UNITS.SECONDS_1)
      return PRICING_UNITS.HOURS_1
    return this.usageUnit
  }

  private getVCpuHours(vCpuFromReport: number): number {
    const instanceType = this.usageType
      .split(':')
      .pop()
      .replace(/^((db|cache|dms|ml|KernelGateway-ml)\.)/, '')

    // When the service is AWS Glue, 4 virtual CPUs are provisioned (from AWS Docs).
    if (this.serviceName === 'AWSGlue') return GLUE_VCPUS_PER_USAGE * this.usageAmount
    if (this.usageType.includes('Aurora:ServerlessUsage')) return this.usageAmount / 4
    if (this.includesAny(['Fargate-vCPU-Hours', 'CPUCredits'], this.usageType)) return this.usageAmount
    if (this.includesAny(Object.keys(BURSTABLE_INSTANCE_BASELINE_UTILIZATION), this.usageType)) {
      return this.getBurstableInstanceVCPu(instanceType) * this.usageAmount
    }
    if (!vCpuFromReport) return this.extractVCpuFromInstanceType(instanceType) * this.usageAmount
    return vCpuFromReport * this.usageAmount
  }

  private getBurstableInstanceVCPu(instanceType: string) {
    return (
      this.extractVCpuFromInstanceType(instanceType) *
      (BURSTABLE_INSTANCE_BASELINE_UTILIZATION[instanceType] / CLOUD_CONSTANTS.AWS.AVG_CPU_UTILIZATION_2020)
    )
  }

  private extractVCpuFromInstanceType(instanceType: string): number {
    if (this.usageType.includes('Kafka')) return MSK_INSTANCE_TYPES[`Kafka${this.usageType.split('Kafka').pop()}`]
    if (this.serviceName === 'AmazonRedshift') return REDSHIFT_INSTANCE_TYPES[this.usageType.split(':').pop()] / 3600
    return EC2_INSTANCE_TYPES[instanceType]
  }

  private includesAny(substrings: string[], usageType: string): boolean {
    return substrings.some((substring) => usageType.includes(substring))
  }
}
