/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import moment from 'moment'
import { BigQuery, Job } from '@google-cloud/bigquery'

import ComputeEstimator from '@domain/ComputeEstimator'
import StorageUsage from '@domain/StorageUsage'
import { StorageEstimator } from '@domain/StorageEstimator'
import ComputeUsage from '@domain/ComputeUsage'
import FootprintEstimate, { MutableEstimationResult } from '@domain/FootprintEstimate'
import { EstimationResult } from '@application/EstimationResult'
import configLoader from '@application/ConfigLoader'
import {
  MEMORY_USAGE_TYPES,
  UNKNOWN_USAGE_TYPES,
  UNKNOWN_SERVICE_TYPES,
  NETWORKING_USAGE_TYPES,
  COMPUTE_STRING_FORMATS,
} from '@services/gcp/BillingExportTypes'
import BillingExportRow from '@services/gcp/BillingExportRow'
import Logger from '@services/Logger'
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import { appendOrAccumulateEstimatesByDay } from '@domain/FootprintEstimate'

export default class BillingExportTable {
  private readonly tableName: string
  private readonly billingExportTableLogger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly bigQuery: BigQuery,
  ) {
    this.tableName = configLoader().GCP.BIG_QUERY_TABLE
    this.billingExportTableLogger = new Logger('BillingExportTable')
  }

  async getEstimates(start: Date, end: Date): Promise<EstimationResult[]> {
    const usageRows = await this.getUsage(start, end)

    const results: MutableEstimationResult[] = []

    usageRows.map((usageRow) => {
      const billingExportRow = new BillingExportRow(usageRow)
      billingExportRow.setTimestamp(usageRow.timestamp)

      if (
        this.isMemoryUsage(billingExportRow.usageType) ||
        this.isNetworkingUsage(billingExportRow.usageType) ||
        this.isUnknownUsage(billingExportRow)
      )
        return []

      let footprintEstimate: FootprintEstimate
      switch (usageRow.usageUnit) {
        case 'seconds':
          if (this.isComputeUsage(billingExportRow.usageType))
            footprintEstimate = this.getComputeFootprintEstimate(billingExportRow, billingExportRow.timestamp)
          else
            this.billingExportTableLogger.warn(
              `Non compute usage type for 'seconds' usageUnit: ${billingExportRow.usageType}`,
            )
          break
        case 'byte-seconds':
          footprintEstimate = this.getStorageFootprintEstimate(billingExportRow, billingExportRow.timestamp)
          break
        default:
          this.billingExportTableLogger.warn(`Unsupported Usage unit: ${usageRow.usageUnit}`)
      }
      appendOrAccumulateEstimatesByDay(results, billingExportRow, footprintEstimate)
    })
    return results
  }

  private getComputeFootprintEstimate(usageRow: any, timestamp: Date): FootprintEstimate {
    const computeUsage: ComputeUsage = {
      cpuUtilizationAverage: CLOUD_CONSTANTS.GCP.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: usageRow.vCpuHours,
      usesAverageCPUConstant: true,
      timestamp,
    }
    return this.computeEstimator.estimate([computeUsage], usageRow.region, 'GCP')[0]
  }

  private getStorageFootprintEstimate(usageRow: any, timestamp: Date): FootprintEstimate {
    // storage estimation requires usage amount in gigabytes
    const usageAmountGb = this.convertByteSecondsToGigabyte(usageRow.usageAmount)
    const storageUsage: StorageUsage = {
      timestamp,
      sizeGb: usageAmountGb,
    }
    if (usageRow.usageType.includes('SSD')) {
      return {
        usesAverageCPUConstant: false,
        ...this.ssdStorageEstimator.estimate([storageUsage], usageRow.region, 'GCP')[0],
      }
    }
    return {
      usesAverageCPUConstant: false,
      ...this.hddStorageEstimator.estimate([storageUsage], usageRow.region, 'GCP')[0],
    }
  }

  private isUnknownUsage(usageRow: any): boolean {
    return (
      this.containsAny(UNKNOWN_USAGE_TYPES, usageRow.usageType) ||
      this.containsAny(UNKNOWN_SERVICE_TYPES, usageRow.serviceName)
    )
  }

  private isMemoryUsage(usageType: string): boolean {
    // We only want to ignore memory usage that is not also compute usage (determined by containing VCPU usage)
    return this.containsAny(MEMORY_USAGE_TYPES, usageType) && !this.containsAny(COMPUTE_STRING_FORMATS, usageType)
  }

  private isNetworkingUsage(usageType: string): boolean {
    return this.containsAny(NETWORKING_USAGE_TYPES, usageType)
  }

  private isComputeUsage(usageType: string): boolean {
    return this.containsAny(COMPUTE_STRING_FORMATS, usageType)
  }

  private containsAny(substrings: string[], stringToSearch: string): boolean {
    return substrings.some((substring) => new RegExp(`\\b${substring}\\b`).test(stringToSearch))
  }

  private async getUsage(start: Date, end: Date): Promise<any[]> {
    const query = `SELECT
                    DATE(usage_start_time) as timestamp,
                    project.name as accountName,
                    location.region as region,
                    service.description as serviceName,
                    sku.description as usageType,
                    usage.unit as usageUnit,
                    system_labels.value AS vCpus,
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
                    accountName,
                    region,
                    serviceName,
                    usageType,
                    usageUnit,
                    vCpus`

    const job: Job = await this.createQueryJob(query)
    return await this.getQueryResults(job)
  }

  private async getQueryResults(job: Job) {
    let rows: any
    try {
      ;[rows] = await job.getQueryResults()
    } catch (e) {
      const { reason, domain, message } = e.errors[0]
      throw new Error(`BigQuery get Query Results failed. Reason: ${reason}, Domain: ${domain}, Message: ${message}`)
    }
    return rows
  }

  private async createQueryJob(query: string) {
    let job: Job
    try {
      ;[job] = await this.bigQuery.createQueryJob({ query: query })
    } catch (e) {
      const { reason, location, message } = e.errors[0]
      throw new Error(`BigQuery create Query Job failed. Reason: ${reason}, Location: ${location}, Message: ${message}`)
    }
    return job
  }

  private convertByteSecondsToGigabyte(usageAmount: number): number {
    return usageAmount / 3600 / 1073741824 / 24
  }
}
