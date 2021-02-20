/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import moment from 'moment'
import FootprintEstimate, { MutableEstimationResult } from '@domain/FootprintEstimate'
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
import { CLOUD_CONSTANTS } from '@domain/FootprintEstimationConstants'
import Logger from '@services/Logger'
import { EstimationResult } from '@application/EstimationResult'
import { ServiceWrapper } from '@services/aws/ServiceWrapper'
import {
  SSD_USAGE_TYPES,
  HDD_USAGE_TYPES,
  NETWORKING_USAGE_TYPES,
  BYTE_HOURS_USAGE_TYPES,
  SSD_SERVICES,
  PRICING_UNITS,
  UNKNOWN_USAGE_TYPES,
  LINE_ITEM_TYPES,
} from '@services/aws/CostAndUsageTypes'
import CostAndUsageReportsRow from '@services/aws/CostAndUsageReportsRow'
import { Athena } from 'aws-sdk'
import { appendOrAccumulateEstimatesByDay } from '@domain/FootprintEstimate'

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

      if (
        this.usageTypeIsNetworking(costAndUsageReportRow.usageType) ||
        this.usageTypeIsUnknown(costAndUsageReportRow.usageType, costAndUsageReportRow.serviceName)
      )
        return []

      const footprintEstimate = this.getEstimateByPricingUnit(costAndUsageReportRow)
      if (footprintEstimate) appendOrAccumulateEstimatesByDay(results, costAndUsageReportRow, footprintEstimate)
    })
    return results
  }

  private getEstimateByPricingUnit(costAndUsageReportRow: CostAndUsageReportsRow) {
    switch (costAndUsageReportRow.usageUnit) {
      case PRICING_UNITS.HOURS_1:
      case PRICING_UNITS.HOURS_2:
      case PRICING_UNITS.HOURS_3:
      case PRICING_UNITS.VCPU_HOURS:
      case PRICING_UNITS.DPU_HOUR:
      case PRICING_UNITS.ACU_HOUR:
        // Compute
        const computeUsage: ComputeUsage = {
          timestamp: costAndUsageReportRow.timestamp,
          cpuUtilizationAverage: CLOUD_CONSTANTS.AWS.AVG_CPU_UTILIZATION_2020,
          numberOfvCpus: costAndUsageReportRow.vCpuHours,
          usesAverageCPUConstant: true,
        }
        return this.computeEstimator.estimate([computeUsage], costAndUsageReportRow.region, 'AWS')[0]
      case PRICING_UNITS.GB_MONTH_1:
      case PRICING_UNITS.GB_MONTH_2:
      case PRICING_UNITS.GB_MONTH_3:
      case PRICING_UNITS.GB_MONTH_4:
      case PRICING_UNITS.GB_HOURS:
        // Storage
        const usageAmountGbMonth = this.getUsageAmountGbMonth(costAndUsageReportRow)

        const storageUsage: StorageUsage = {
          timestamp: costAndUsageReportRow.timestamp,
          sizeGb: usageAmountGbMonth * moment(costAndUsageReportRow.timestamp).daysInMonth(),
        }

        let estimate: FootprintEstimate
        if (this.usageTypeIsSSD(costAndUsageReportRow))
          estimate = this.ssdStorageEstimator.estimate([storageUsage], costAndUsageReportRow.region, 'AWS')[0]
        else if (this.usageTypeIsHDD(costAndUsageReportRow.usageType))
          estimate = this.hddStorageEstimator.estimate([storageUsage], costAndUsageReportRow.region, 'AWS')[0]
        else
          this.costAndUsageReportsLogger.warn(
            `Unexpected usage type for storage service: ${costAndUsageReportRow.usageType}`,
          )
        if (estimate) estimate.usesAverageCPUConstant = false
        return estimate
      case PRICING_UNITS.SECONDS_1:
      case PRICING_UNITS.SECONDS_2:
        // Lambda
        const lambdaComputeUsage: ComputeUsage = {
          timestamp: costAndUsageReportRow.timestamp,
          cpuUtilizationAverage: CLOUD_CONSTANTS.AWS.AVG_CPU_UTILIZATION_2020,
          numberOfvCpus: costAndUsageReportRow.usageAmount / 3600,
          usesAverageCPUConstant: true,
        }
        return this.computeEstimator.estimate([lambdaComputeUsage], costAndUsageReportRow.region, 'AWS')[0]
      default:
        this.costAndUsageReportsLogger.warn(`Unexpected pricing unit: ${costAndUsageReportRow.usageUnit}`)
    }
  }

  private getUsageAmountGbMonth(costAndUsageReportRow: CostAndUsageReportsRow): number {
    if (this.usageTypeisByteHours(costAndUsageReportRow.usageType)) {
      // Convert from Byte-Hours to GB-Month
      return costAndUsageReportRow.usageAmount / 1073741824 / 24 / 31
    }
    const hoursInMonth = moment(costAndUsageReportRow.timestamp).daysInMonth()
    // Convert from GB-Hours to GB-Month
    if (costAndUsageReportRow.usageUnit === PRICING_UNITS.GB_HOURS)
      return costAndUsageReportRow.usageAmount / (hoursInMonth * 24)
    return costAndUsageReportRow.usageAmount
  }

  private usageTypeIsSSD(costAndUsageRow: CostAndUsageReportsRow): boolean {
    // Here we have two potential SSD use cases:
    // 1. The usage type ends with a set of assumed SSD Storage types
    // 2. The usage is from a service we don't know the underlying storage type so overestimate and assume SSD,
    // but not when the usage type is backup, which we assume this is usage using S3 (which is HDD).
    return (
      this.endsWithAny(SSD_USAGE_TYPES, costAndUsageRow.usageType) ||
      (this.endsWithAny(SSD_SERVICES, costAndUsageRow.serviceName) && !costAndUsageRow.usageType.includes('Backup'))
    )
  }

  private usageTypeIsHDD(usageType: string): boolean {
    return this.endsWithAny(HDD_USAGE_TYPES, usageType)
  }

  private usageTypeisByteHours(usageType: string): boolean {
    return this.endsWithAny(BYTE_HOURS_USAGE_TYPES, usageType)
  }

  private usageTypeIsNetworking(usageType: string): boolean {
    return this.endsWithAny(NETWORKING_USAGE_TYPES, usageType)
  }

  private usageTypeIsUnknown(usageType: string, serviceName: string): boolean {
    return (
      this.endsWithAny(UNKNOWN_USAGE_TYPES, usageType) ||
      UNKNOWN_USAGE_TYPES.some((unknownUsageType) => usageType.includes(unknownUsageType)) ||
      serviceName === 'AmazonSimpleDB'
    )
  }

  private endsWithAny(suffixes: string[], string: string): boolean {
    return suffixes.some((suffix) => string.endsWith(suffix))
  }

  private async getUsage(start: Date, end: Date): Promise<Athena.Row[]> {
    const params = {
      QueryString: `SELECT DATE(line_item_usage_start_date) AS timestamp,
                        line_item_usage_account_id as accountName,
                        product_region as region,
                        line_item_product_code as serviceName,
                        line_item_usage_type as usageType,
                        pricing_unit as usageUnit,
                        product_vcpu as vCpus,
                    SUM(line_item_usage_amount) as usageAmount,
                    SUM(line_item_blended_cost) as cost
                    FROM ${this.tableName}
                    WHERE line_item_line_item_type IN ('${LINE_ITEM_TYPES.join(`', '`)}')
                    AND pricing_unit IN ('${Object.values(PRICING_UNITS).join(`', '`)}')
                    AND line_item_usage_start_date >= DATE('${moment(start).format('YYYY-MM-DD')}')
                    AND line_item_usage_end_date <= DATE('${moment(end).format('YYYY-MM-DD')}')
                    GROUP BY 
                        1,2,3,4,5,6,7`,
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
