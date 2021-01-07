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
import ComputeUsage from '@domain/ComputeUsage'
import FootprintEstimate from '@domain/FootprintEstimate'
import { EstimationResult } from '@application/EstimationResult'
import configLoader from '@application/ConfigLoader'
import buildEstimateFromCostAndUsageRow, { MutableEstimationResult } from '@services/aws/CostAndUsageReportsMapper'
import {
  MEMORY_USAGE_TYPES,
  UNKNOWN_USAGE_TYPES,
  UNKNOWN_SERVICE_TYPES,
  NETWORKING_USAGE_TYPES,
  VCPU_STRING_FORMATS,
} from '@services/gcp/BillingExportTypes'

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
      if (
        this.isMemoryUsage(usageRow.usageType) ||
        this.isNetworkingUsage(usageRow.usageType) ||
        this.isUnknownUsage(usageRow)
      )
        return []

      // Handle Cloud SQL edge case where we can infer the vCPUs from the usage type.
      if (usageRow.serviceName === 'Cloud SQL' && usageRow.usageUnit === 'seconds') {
        usageRow.vcpus = this.getVCpuForCloudSQL(usageRow)
        if (!usageRow.vcpus) return []
      }

      const timestamp = new Date(usageRow.timestamp.value)
      usageRow.cloudProvider = 'GCP'
      usageRow.timestamp = timestamp

      // if usageUnit is seconds then estimate compute otherwise estimate storage
      const footprintEstimate =
        usageRow.usageUnit === 'seconds'
          ? this.getComputeFootprintEstimate(usageRow, timestamp)
          : this.getStorageFootprintEstimate(usageRow, timestamp)
      buildEstimateFromCostAndUsageRow(results, usageRow, footprintEstimate)
    })
    return results
  }

  private getComputeFootprintEstimate(usageRow: any, timestamp: Date): FootprintEstimate {
    const computeUsage: ComputeUsage = {
      cpuUtilizationAverage: 50,
      numberOfvCpus: this.getVCpuHours(usageRow),
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
    return this.containsAny(MEMORY_USAGE_TYPES, usageType) && !this.containsAny(VCPU_STRING_FORMATS, usageType)
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
                    usage.unit as usageUnit,
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
    return usageAmount / 3600 / 1073741824 / 24
  }

  private getVCpuHours(usageRow: any): number {
    return (usageRow.vcpus * usageRow.usageAmount) / 3600
  }

  private getVCpuForCloudSQL(usageRow: any): string | null {
    const extractedVCPUValue = this.extractVCpuFromUsageType(usageRow.usageType)
    if (extractedVCPUValue) return extractedVCPUValue
    return null
  }

  private extractVCpuFromUsageType(usageType: string): string {
    const vcpu = usageType.match(/\d+(?: [vV]CPU)/g)
    return vcpu && vcpu[0].split(' ')[0]
  }
}
