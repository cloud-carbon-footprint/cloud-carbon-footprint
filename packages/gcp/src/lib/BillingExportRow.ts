/*
 * © 2021 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { GCP_REGIONS } from './GCPRegions'
import { BigQueryDate } from '@google-cloud/bigquery'
import { configLoader, containsAny } from '@cloud-carbon-footprint/common'
import { SERVICES_TO_OVERRIDE_USAGE_UNIT_AS_UNKNOWN } from './BillingExportTypes'
import { SHARED_CORE_PROCESSORS } from './MachineTypes'

export default class BillingExportRow extends BillingDataRow {
  constructor(init: Partial<BillingExportRow>) {
    super(init)
    this.cloudProvider = 'GCP'
    if (!this.region) this.region = GCP_REGIONS.UNKNOWN
    this.vCpuHours = this.getVCpuHours()
    this.gpuHours = this.usageAmount / 3600
    this.timestamp = new Date((init.timestamp as unknown as BigQueryDate).value)

    // These service have very large amount of usage with units 'seconds' and 'requests'.
    // This significantly overestimates their footprint, so override their usage unit to take this into account.
    if (
      containsAny(SERVICES_TO_OVERRIDE_USAGE_UNIT_AS_UNKNOWN, this.serviceName)
    )
      this.usageUnit = 'Unknown'

    // Default machine type size for GKE, which Cloud Composer also uses under the hood
    if (this.isCloudComposerCompute() || this.isKubernetesCompute())
      this.machineType = SHARED_CORE_PROCESSORS.E2_MEDIUM

    // Because this usage amount represents 1000 millicores, each being equivalent to 1 vCPU. Source: https://cloud.google.com/composer/pricing
    if (this.usageType.includes('Pod mCPU Requests'))
      this.usageAmount = this.usageAmount / 1000
  }

  private getVCpuHours(): number {
    if (this.isCloudComposerCompute())
      return (
        (this.usageAmount / 3600) *
        configLoader().GCP.VCPUS_PER_CLOUD_COMPOSER_ENVIRONMENT
      )
    if (this.isKubernetesCompute())
      return (
        (this.usageAmount / 3600) * configLoader().GCP.VCPUS_PER_GKE_CLUSTER
      )
    return this.usageAmount / 3600
  }

  private isCloudComposerCompute(): boolean {
    return (
      this.usageType.includes('Cloud Composer Compute CPUs') ||
      this.usageType.includes('Cloud Composer vCPU') ||
      this.usageType.includes('Cloud Composer SQL vCPU')
    )
  }

  private isKubernetesCompute(): boolean {
    return this.usageType.includes('Kubernetes Clusters')
  }
}
