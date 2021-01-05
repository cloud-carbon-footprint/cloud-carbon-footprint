/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
/* eslint-disable */
/* istanbul ignore file */
import moment from 'moment'
import { BigQuery } from '@google-cloud/bigquery'

import ComputeEstimator from '@domain/ComputeEstimator'
import StorageUsage from '@domain/StorageUsage'
import { StorageEstimator } from '@domain/StorageEstimator'
import { EstimationResult } from '@application/EstimationResult'
import configLoader from '@application/ConfigLoader'
import buildEstimateFromCostAndUsageRow, { MutableEstimationResult } from '@services/aws/CostAndUsageReportsMapper'
import { NETWORKING_USAGE_TYPES } from '@services/gcp/BillingExportUsageTypes'

export default class BillingExportTable {
  private readonly tableName: string

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly bigQuery: BigQuery,
  ) {
    this.tableName = configLoader().GCP.BIG_QUERY_TABLE
  }

  async getEstimates(start: Date, end: Date): Promise<EstimationResult[]> {
    const usageRows = await this.getUsage(start, end)

    const results: MutableEstimationResult[] = []

    usageRows.map((usageRow) => {
      if (this.isNetworkingUsage(usageRow.usageType)) return []

      const usageAmountGb = this.convertByteSecondsToGigabyte(usageRow.usageAmount)
      const timestamp = new Date(usageRow.timestamp.value)
      usageRow.cloudProvider = 'GCP'
      usageRow.timestamp = timestamp

      const storageUsage: StorageUsage = {
        timestamp: timestamp,
        sizeGb: usageAmountGb,
      }

      const footprintEstimate = this.hddStorageEstimator.estimate([storageUsage], usageRow.region, 'GCP')[0]
      footprintEstimate.usesAverageCPUConstant = false
      buildEstimateFromCostAndUsageRow(results, usageRow, footprintEstimate)
    })
    return results
  }

  private isNetworkingUsage(usageType: string): boolean {
    return this.containsAny(NETWORKING_USAGE_TYPES, usageType)
  }

  private containsAny(substrings: string[], stringToSearch: string): boolean {
    return substrings.some((substring) => new RegExp(`\\b${substring}\\b`).test(stringToSearch))
  }

  private async getUsage(start: Date, end: Date): Promise<any[]> {
    const query = `SELECT
                          DATE(usage_start_time) AS timestamp,
                    project.name as accountName,
                    location.region as region,
                    service.description as serviceName,
                    sku.description as usageType,
                    usage.unit as usageType,
                    system_labels.value AS vcpus,
                    SUM(usage.amount) AS usageAmount,
                    SUM(cost) AS cost
                  FROM
                    \`${this.tableName}\`
                  LEFT JOIN
                  UNNEST(system_labels) AS system_labels
                  ON
                  system_labels.key LIKE "%cores%"
                  WHERE
                  cost_type != 'rounding_error'
                  AND usage.unit IN ('byte-seconds', 'seconds')
                  AND usage_start_time >= TIMESTAMP('${moment(start).format('YYYY-MM-DD')}')
                  AND usage_end_time <= TIMESTAMP('${moment(end).format('YYYY-MM-DD')}')
                  GROUP BY
                  timestamp,
                    project.name,
                    location.region,
                    service.description,
                    sku.description,
                    usage.unit,
                    vcpus`

    const [job] = await this.bigQuery.createQueryJob({ query: query })

    const [rows] = await job.getQueryResults()
    return rows
  }

  private convertByteSecondsToGigabyte(usageAmount: number): number {
    return usageAmount / 60 / 60 / 1073741824 / 24
  }
}
