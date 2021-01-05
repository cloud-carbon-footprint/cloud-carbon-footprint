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
    const query = `SELECT
                          DATE(usage_start_time) AS date,
                    project.name as project_name,
                    location.region,
                    service.description as service_description,
                    sku.description as sku_description,
                    usage.unit as usage_unit,
                    system_labels.value AS vcpus,
                    SUM(usage.amount) AS total_line_item_usage_amount,
                    SUM(cost) AS total_cost
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
                  date,
                    project.name,
                    location.region,
                    service.description,
                    sku.description,
                    usage.unit,
                    vcpus`

    const [job] = await this.bigQuery.createQueryJob({query: query});

    const [rows] = await job.getQueryResults();

    return rows.map((row) => {
      const usageAmountGb = this.convertByteSecondsToGigabyte(row.total_line_item_usage_amount)
      const timestamp = new Date(row.date.value)
      const storageUsage: StorageUsage = {
        timestamp: timestamp,
        sizeGb: usageAmountGb,
      }

      const estimate = this.hddStorageEstimator.estimate([storageUsage], row.region, 'GCP')[0]

      return { timestamp: timestamp, serviceEstimates: [
        {
          cloudProvider: 'GCP',
          accountName: row.project_name,
          serviceName: row.service_description,
          wattHours: estimate.wattHours,
          co2e: estimate.co2e,
          cost: row.total_cost,
          region: row.region,
          usesAverageCPUConstant: false,
        }
      ] }
    })
  }

  private convertByteSecondsToGigabyte(usageAmount: number): number {
    return usageAmount/60/60/1073741824/24
  }
}
