/*
 * © 2021 Thoughtworks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { GCP_REGIONS } from './GCPRegions'
import { BigQueryDate } from '@google-cloud/bigquery'
import { containsAny } from '@cloud-carbon-footprint/common'
import { SERVICES_TO_OVERRIDE_USAGE_UNIT_AS_UNKNOWN } from './BillingExportTypes'

export default class BillingExportRow extends BillingDataRow {
  constructor(init: Partial<BillingExportRow>) {
    super(init)
    this.cloudProvider = 'GCP'
    if (!this.region) this.region = GCP_REGIONS.UNKNOWN
    this.vCpuHours = this.usageAmount / 3600
    this.timestamp = new Date((init.timestamp as unknown as BigQueryDate).value)
    // These service have very large amount of usage with units 'seconds' and 'requests'.
    // This significantly overestimates their footprint, so override their usage unit to take this into account.
    if (
      containsAny(SERVICES_TO_OVERRIDE_USAGE_UNIT_AS_UNKNOWN, this.serviceName)
    )
      this.usageUnit = 'Unknown'
  }
}
