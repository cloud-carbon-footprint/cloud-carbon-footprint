/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import moment from 'moment'
import FootprintEstimate from '@domain/FootprintEstimate'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import configLoader from '@application/ConfigLoader'
import {
  GetQueryExecutionInput,
  GetQueryExecutionOutput,
  GetQueryResultsOutput,
  StartQueryExecutionInput,
  StartQueryExecutionOutput,
  Row,
} from 'aws-sdk/clients/athena'
import ComputeUsage from '@domain/ComputeUsage'
import StorageUsage from '@domain/StorageUsage'
import { CLOUD_CONSTANTS, estimateCo2 } from '@domain/FootprintEstimationConstants'
import Logger from '@services/Logger'
import { EstimationResult } from '@application/EstimationResult'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'
import { SSD_USAGE_TYPES, HDD_USAGE_TYPES, NETWORKING_USAGE_TYPES } from '@services/aws/AWSUsageTypes'
import CostAndUsageReportsRow from '@services/aws/CostAndUsageReportsRow'
import buildEstimateFromCostAndUsageRow, { MutableEstimationResult } from '@services/aws/CostAndUsageReportsMapper'

export default class CostAndUsageReports {
  private readonly dataBaseName: string
  private readonly tableName: string
  private readonly queryResultsLocation: string
  private readonly costAndUsageReportsLogger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly serviceWrapper: ServiceWrapper,
  ) {
    this.dataBaseName = configLoader().AWS.ATHENA_DB_NAME
    this.tableName = configLoader().AWS.ATHENA_DB_TABLE
    this.queryResultsLocation = configLoader().AWS.ATHENA_QUERY_RESULT_LOCATION
    this.costAndUsageReportsLogger = new Logger('CostAndUsageReports')
  }
  async getEstimates(start: Date, end: Date): Promise<EstimationResult[]> {
    const usageRows = await this.getUsage(start, end)
    const usageRowsHeader: Row = usageRows.shift()

    const results: MutableEstimationResult[] = []

    usageRows.map((rowData: Row) => {
      const costAndUsageReportRow = new CostAndUsageReportsRow(usageRowsHeader, rowData.Data)

      if (this.usageTypeIsNetWorking(costAndUsageReportRow.usageType)) return []

      const footprintEstimate = this.getEstimateByPricingUnit(costAndUsageReportRow)
      buildEstimateFromCostAndUsageRow(results, costAndUsageReportRow, footprintEstimate)
    })
    return results
  }

  private getEstimateByPricingUnit(costAndUsageReportRow: CostAndUsageReportsRow) {
    switch (costAndUsageReportRow.pricingUnit) {
      case 'Hrs':
      case 'DPU-Hour':
        // Compute
        const computeUsage: ComputeUsage = {
          timestamp: costAndUsageReportRow.timestamp,
          cpuUtilizationAverage: 50,
          numberOfvCpus: costAndUsageReportRow.vCpuHours,
          usesAverageCPUConstant: true,
        }
        return this.computeEstimator.estimate([computeUsage], costAndUsageReportRow.region, 'AWS')[0]
      case 'GB-Mo':
      case 'GB-Hours':
        // Storage
        // Convert GB-Hours to GB-Month
        const usageAmountGbMonth =
          costAndUsageReportRow.pricingUnit === 'GB-Mo'
            ? costAndUsageReportRow.usageAmount
            : costAndUsageReportRow.usageAmount / 744

        const storageUsage: StorageUsage = {
          timestamp: costAndUsageReportRow.timestamp,
          sizeGb: usageAmountGbMonth * moment(costAndUsageReportRow.timestamp).daysInMonth(),
        }

        let estimate: FootprintEstimate
        if (this.usageTypeIsSSD(costAndUsageReportRow.usageType))
          estimate = this.ssdStorageEstimator.estimate([storageUsage], costAndUsageReportRow.region)[0]
        else if (this.usageTypeIsHDD(costAndUsageReportRow.usageType))
          estimate = this.hddStorageEstimator.estimate([storageUsage], costAndUsageReportRow.region)[0]
        else
          this.costAndUsageReportsLogger.warn(
            `Unexpected usage type for storage service: ${costAndUsageReportRow.usageType}`,
          )
        estimate.usesAverageCPUConstant = false
        return estimate
      case 'seconds':
      case 'Second':
        // Lambda
        const wattHours =
          (costAndUsageReportRow.usageAmount / 3600) *
          CLOUD_CONSTANTS.AWS.MAX_WATTS *
          CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS
        const co2e = estimateCo2(wattHours, 'AWS', costAndUsageReportRow.region)
        return { timestamp: costAndUsageReportRow.timestamp, wattHours, co2e, usesAverageCPUConstant: true }
      default:
        this.costAndUsageReportsLogger.warn(`Unexpected pricing unit: ${costAndUsageReportRow.pricingUnit}`)
    }
  }

  private usageTypeIsSSD(usageType: string): boolean {
    return this.endsWithAny(SSD_USAGE_TYPES, usageType)
  }

  private usageTypeIsHDD(usageType: string): boolean {
    return this.endsWithAny(HDD_USAGE_TYPES, usageType)
  }

  private usageTypeIsNetWorking(usageType: string): boolean {
    return this.endsWithAny(NETWORKING_USAGE_TYPES, usageType)
  }

  private endsWithAny(suffixes: string[], string: string): boolean {
    return suffixes.some((suffix) => string.endsWith(suffix))
  }

  private async getUsage(start: Date, end: Date): Promise<any[]> {
    const params = {
      QueryString: `SELECT DATE(line_item_usage_start_date) AS day,
                        line_item_usage_account_id,
                        product_region,
                        line_item_product_code,
                        line_item_usage_type,
                        pricing_unit,
                        product_vcpu,
                    SUM(line_item_usage_amount) AS total_line_item_usage_amount,
                    SUM(line_item_blended_cost) AS total_cost
                    FROM ${this.tableName}
                    WHERE line_item_line_item_type IN ('Usage', 'DiscountedUsage')
                    AND pricing_unit IN ('Hrs', 'GB-Mo', 'seconds', 'DPU-Hour', 'GB-Hours')
                    AND line_item_usage_start_date >= DATE('${moment(start).format('YYYY-MM-DD')}')
                    AND line_item_usage_end_date <= DATE('${moment(end).format('YYYY-MM-DD')}')
                    GROUP BY DATE(line_item_usage_start_date), 
                            line_item_usage_account_id, 
                            product_region, 
                            line_item_product_code, 
                            line_item_usage_type, 
                            pricing_unit, 
                            product_vcpu`,
      QueryExecutionContext: {
        Database: this.dataBaseName,
      },
      ResultConfiguration: {
        EncryptionConfiguration: {
          EncryptionOption: 'SSE_S3',
        },
        OutputLocation: this.queryResultsLocation,
      },
    }
    const response = await this.startQuery(params)

    const queryExecutionInput: GetQueryExecutionInput = {
      QueryExecutionId: response.QueryExecutionId,
    }
    return await this.getQueryResultSetRows(queryExecutionInput)
  }

  private async startQuery(queryParams: StartQueryExecutionInput): Promise<StartQueryExecutionOutput> {
    let response: StartQueryExecutionOutput
    try {
      response = await this.serviceWrapper.startAthenaQueryExecution(queryParams)
    } catch (e) {
      throw new Error(`Athena start query failed. Reason ${e.message}.`)
    }
    return response
  }

  private async getQueryResultSetRows(queryExecutionInput: GetQueryExecutionInput) {
    while (true) {
      const queryExecutionResults: GetQueryExecutionOutput = await this.serviceWrapper.getAthenaQueryExecution(
        queryExecutionInput,
      )
      const queryStatus = queryExecutionResults.QueryExecution.Status
      if (queryStatus.State === ('FAILED' || 'CANCELLED'))
        throw new Error(
          `Athena query failed. Reason ${queryStatus.StateChangeReason}. Query ID: ${queryExecutionInput.QueryExecutionId}`,
        )
      if (queryStatus.State === 'SUCCEEDED') break

      await wait(1000)
    }
    const results: GetQueryResultsOutput[] = await this.serviceWrapper.getAthenaQueryResultSets(queryExecutionInput)
    return results.flatMap((result) => result.ResultSet.Rows)
  }
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
