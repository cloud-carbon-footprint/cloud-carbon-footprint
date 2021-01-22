/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { GCP_REGIONS } from '@services/gcp/GCPRegions'
import BillingDataRow from '@domain/BillingDataRow'
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
