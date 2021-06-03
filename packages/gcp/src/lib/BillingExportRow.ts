/*
 * © 2021 ThoughtWorks, Inc.
 */

import { BillingDataRow } from '@cloud-carbon-footprint/core'
import { GCP_REGIONS } from './GCPRegions'
import { BigQueryDate } from '@google-cloud/bigquery'

export default class BillingExportRow extends BillingDataRow {
  constructor(init: Partial<BillingExportRow>) {
    super(init)
    this.cloudProvider = 'GCP'
    if (!this.region) this.region = GCP_REGIONS.UNKNOWN
    this.vCpuHours = this.usageAmount / 3600
  }

  setTimestamp(date: BigQueryDate): void {
    this.timestamp = new Date(date.value)
  }
}
