/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { BigQueryDate } from '@google-cloud/bigquery'
import { GCP_REGIONS } from '@services/gcp/GCPRegions'
import BillingDataRow from '@domain/BillingDataRow'

export default class BillingExportRow extends BillingDataRow {
  constructor(init: Partial<BillingExportRow>) {
    super(init)
    this.cloudProvider = 'GCP'
    if (!this.region) this.region = GCP_REGIONS.UNKNOWN
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
