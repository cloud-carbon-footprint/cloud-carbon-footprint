/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
import moment from 'moment'
import { Athena as AWSAthena } from 'aws-sdk'
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
} from 'aws-sdk/clients/athena'
import ComputeUsage from '@domain/ComputeUsage'
import StorageUsage from '@domain/StorageUsage'
import { CLOUD_CONSTANTS, estimateCo2 } from '@domain/FootprintEstimationConstants'
import Logger from '@services/Logger'
import { EstimationResult } from '@application/EstimationResult'

interface QueryResultsRow {
  Data: QueryResultsColumn[]
}

interface QueryResultsColumn {
  VarCharValue: string
}

interface MutableEstimationResult {
  timestamp: Date
  serviceEstimates: MutableServiceEstimate[]
}

interface MutableServiceEstimate {
  cloudProvider: string
  accountName: string
  serviceName: string
  wattHours: number
  co2e: number
  cost: number
  region: string
  usesAverageCPUConstant: boolean
}

export default class Athena {
  serviceName = 'athena'
  private readonly dataBaseName: string
  private readonly tableName: string
  private readonly queryResultsLocation: string
  private readonly athena: AWSAthena
  private readonly athenaLogger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
  ) {
    this.dataBaseName = configLoader().AWS.ATHENA_DB_NAME
    this.tableName = configLoader().AWS.ATHENA_DB_TABLE
    this.queryResultsLocation = configLoader().AWS.ATHENA_QUERY_RESULT_LOCATION
    this.athena = new AWSAthena({ region: configLoader().AWS.ATHENA_REGION })
    this.athenaLogger = new Logger('Athena')
  }
  async getEstimates(start: Date, end: Date): Promise<EstimationResult[]> {
    const usageRows = await this.getUsage(start, end)
    const usageRowsHeader: QueryResultsRow = usageRows.shift()

    const dayIndex = getIndexOfObjectByValue(usageRowsHeader, 'day')
    const accountIdIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_usage_account_id')
    const regionIndex = getIndexOfObjectByValue(usageRowsHeader, 'product_region')
    const serviceNameIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_product_code')
    const usageTypeIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_usage_type')
    const pricingUnitIndex = getIndexOfObjectByValue(usageRowsHeader, 'pricing_unit')
    const vcpuIndex = getIndexOfObjectByValue(usageRowsHeader, 'product_vcpu')
    const totalUsageAmountIndex = getIndexOfObjectByValue(usageRowsHeader, 'total_line_item_usage_amount')
    const totalCostIndex = getIndexOfObjectByValue(usageRowsHeader, 'total_cost')

    const results: MutableEstimationResult[] = []

    usageRows.map((row: QueryResultsRow) => {
      const rowValues = Object.values(row.Data)
      const region = rowValues[regionIndex].VarCharValue
      const timestamp = new Date(rowValues[dayIndex].VarCharValue)
      const serviceName = rowValues[serviceNameIndex].VarCharValue
      const usageType = rowValues[usageTypeIndex].VarCharValue
      const accountName = rowValues[accountIdIndex].VarCharValue
      const usageAmount = Number(rowValues[totalUsageAmountIndex].VarCharValue)
      const numberOfvCPUHours = Number(rowValues[vcpuIndex].VarCharValue) * usageAmount
      const pricingUnit = rowValues[pricingUnitIndex].VarCharValue
      const cost = Number(rowValues[totalCostIndex].VarCharValue)

      const footprintEstimate = this.getEstimateByPricingUnit(
        pricingUnit,
        timestamp,
        numberOfvCPUHours,
        usageAmount,
        region,
        usageType,
      )

      const serviceEstimate: MutableServiceEstimate = {
        cloudProvider: 'AWS',
        wattHours: footprintEstimate.wattHours,
        co2e: footprintEstimate.co2e,
        usesAverageCPUConstant: footprintEstimate.usesAverageCPUConstant,
        serviceName: this.getServiceNameFromUsageType(serviceName, usageType),
        accountName: accountName,
        region: region,
        cost: cost,
      }

      if (this.dayExistsInEstimates(results, timestamp)) {
        const estimatesForDay = results.find((estimate) => estimate.timestamp.getTime() === timestamp.getTime())

        if (this.estimateExistsForRegionAndService(results, timestamp, serviceEstimate)) {
          const estimateToAcc = estimatesForDay.serviceEstimates.find((estimateForDay) => {
            return this.hasSameRegionAndService(estimateForDay, serviceEstimate)
          })
          estimateToAcc.wattHours += serviceEstimate.wattHours
          estimateToAcc.co2e += serviceEstimate.co2e
          estimateToAcc.cost += serviceEstimate.cost
          if (serviceEstimate.usesAverageCPUConstant) {
            estimateToAcc.usesAverageCPUConstant =
              estimateToAcc.usesAverageCPUConstant || serviceEstimate.usesAverageCPUConstant
          }
        } else {
          estimatesForDay.serviceEstimates.push(serviceEstimate)
        }
      } else {
        results.push({
          timestamp: timestamp,
          serviceEstimates: [serviceEstimate],
        })
      }
    })
    return results
  }

  private getEstimateByPricingUnit(
    pricingUnit: string,
    timestamp: Date,
    numberOfvCPUHours: number,
    usageAmount: number,
    region: string,
    usageType: string,
  ) {
    switch (pricingUnit) {
      case 'Hrs':
        // Compute
        const computeUsage: ComputeUsage = {
          timestamp: timestamp,
          cpuUtilizationAverage: 50,
          numberOfvCpus: numberOfvCPUHours,
          usesAverageCPUConstant: true,
        }
        return this.computeEstimator.estimate([computeUsage], region, 'AWS')[0]
      case 'GB-Mo':
        // Storage
        const storageUsage: StorageUsage = {
          timestamp: timestamp,
          sizeGb: usageAmount * moment(timestamp).daysInMonth(),
        }

        let estimate: FootprintEstimate
        if (this.usageTypeIsSSD(usageType)) estimate = this.ssdStorageEstimator.estimate([storageUsage], region)[0]
        else if (this.usageTypeIsHDD(usageType)) estimate = this.hddStorageEstimator.estimate([storageUsage], region)[0]
        else this.athenaLogger.warn(`Unexpected usage type for storage service: ${usageType}`)
        estimate.usesAverageCPUConstant = false
        return estimate
      case 'seconds':
        // Lambda
        const wattHours =
          (usageAmount / 3600) * CLOUD_CONSTANTS.AWS.MAX_WATTS * CLOUD_CONSTANTS.AWS.POWER_USAGE_EFFECTIVENESS
        const co2e = estimateCo2(wattHours, 'AWS', region)
        return { timestamp, wattHours, co2e, usesAverageCPUConstant: true }
      default:
        this.athenaLogger.warn(`Unexpected pricing unit: ${pricingUnit}`)
    }
  }

  private usageTypeIsSSD(usageType: string) {
    return (
      usageType.endsWith('VolumeUsage.gp2') ||
      usageType.endsWith('VolumeUsage.piops') ||
      usageType.endsWith('GP2-Storage') ||
      usageType.endsWith('PIOPS-Storage')
    )
  }

  private usageTypeIsHDD(usageType: string) {
    return (
      usageType.endsWith('VolumeUsage.st1') ||
      usageType.endsWith('VolumeUsage.sc1') ||
      usageType.endsWith('VolumeUsage') ||
      usageType.endsWith('SnapshotUsage') ||
      usageType.endsWith('TimedStorage-ByteHrs') ||
      usageType.endsWith('StorageUsage')
    )
  }

  private dayExistsInEstimates(results: MutableEstimationResult[], timestamp: Date): boolean {
    return results.some((estimate) => estimate.timestamp.getTime() === timestamp.getTime())
  }

  private estimateExistsForRegionAndService(
    results: MutableEstimationResult[],
    timestamp: Date,
    serviceEstimate: MutableServiceEstimate,
  ): boolean {
    const estimatesForDay = results.find((estimate) => estimate.timestamp.getTime() === timestamp.getTime())
    return estimatesForDay.serviceEstimates.some((estimateForDay) => {
      return this.hasSameRegionAndService(estimateForDay, serviceEstimate)
    })
  }

  private hasSameRegionAndService(estimateOne: MutableServiceEstimate, estimateTwo: MutableServiceEstimate): boolean {
    return estimateOne.region === estimateTwo.region && estimateOne.serviceName === estimateTwo.serviceName
  }

  private getServiceNameFromUsageType(serviceName: string, usageType: string): string {
    const serviceNameMapping: { [usageType: string]: string } = {
      AWSLambda: 'lambda',
      AmazonRDS: 'rds',
      AmazonCloudWatch: 'cloudwatch',
      AmazonS3: 's3',
    }

    if (serviceName === 'AmazonEC2') {
      return usageType.includes('BoxUsage') ? 'ec2' : 'ebs'
    }
    return serviceNameMapping[serviceName]
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
                    AND pricing_unit IN ('Hrs', 'GB-Mo', 'seconds')
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
      response = await this.athena.startQueryExecution(queryParams).promise()
    } catch (e) {
      throw new Error(`Athena start query failed. Reason ${e.message}.`)
    }
    return response
  }

  private async getQueryResultSetRows(queryExecutionInput: GetQueryExecutionInput) {
    while (true) {
      const queryExecutionResults: GetQueryExecutionOutput = await this.athena
        .getQueryExecution(queryExecutionInput)
        .promise()
      const queryStatus = queryExecutionResults.QueryExecution.Status
      if (queryStatus.State === ('FAILED' || 'CANCELLED'))
        throw new Error(
          `Athena query failed. Reason ${queryStatus.StateChangeReason}. Query ID: ${queryExecutionInput.QueryExecutionId}`,
        )
      if (queryStatus.State === 'SUCCEEDED') break

      await wait(1000)
    }
    const results: GetQueryResultsOutput = await this.athena.getQueryResults(queryExecutionInput).promise()
    return results.ResultSet.Rows
  }
}

function getIndexOfObjectByValue(data: QueryResultsRow, value: string) {
  return data.Data.map((item: QueryResultsColumn) => item.VarCharValue).indexOf(value)
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
