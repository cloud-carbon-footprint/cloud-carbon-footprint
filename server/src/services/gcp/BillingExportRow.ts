/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { BigQueryDate } from '@google-cloud/bigquery'

export default class BillingExportRow {
  public readonly cloudProvider: string
  public readonly region: string
  public readonly productCode: string
  public readonly serviceName: string
  public readonly accountName: string
  public readonly usageAmount: number
  public readonly usageType: string
  public readonly usageUnit: string
  public readonly cost: number
  public timestamp: Date
  public vCpuHours: number

  constructor(init: Partial<BillingExportRow>) {
    Object.assign(this, init)
    this.cloudProvider = 'GCP'
  }

  setTimestamp(date: BigQueryDate): void {
    this.timestamp = new Date(date.value)
  }

  setVCpuHours(vCpus: string): void {
    // Handle Cloud SQL edge case where we can infer the vCPUs from the usage type.
    if (this.isCloudSQLCompute()) {
      this.vCpuHours = this.getVCpuHours(this.getVCpuForCloudSQL())
    } else {
      this.vCpuHours = this.getVCpuHours(vCpus)
    }
  }

  isCloudSQLCompute() {
    return this.serviceName === 'Cloud SQL' && this.usageUnit === 'seconds'
  }

  private getVCpuForCloudSQL(): string | null {
    const extractedVCPUValue = this.extractVCpuFromUsageType()
    if (extractedVCPUValue) return extractedVCPUValue
    return null
  }

  private extractVCpuFromUsageType(): string {
    const vcpu = this.usageType.match(/\d+(?: [vV]CPU)/g)
    return vcpu && vcpu[0].split(' ')[0]
  }

  private getVCpuHours(vCpus: string): number {
    return (Number(vCpus) * this.usageAmount) / 3600
  }
}
