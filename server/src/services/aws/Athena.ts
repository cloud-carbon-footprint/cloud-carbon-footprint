/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
/* istanbul ignore file */
/* eslint-disable */
import moment from 'moment'
import { Athena as AWSAthena } from 'aws-sdk'
import FootprintEstimate from '@domain/FootprintEstimate'
import Cost from '@domain/Cost'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import configLoader from '@application/ConfigLoader'
import { GetQueryExecutionOutput, GetQueryResultsOutput, StartQueryExecutionOutput } from 'aws-sdk/clients/athena'
import ComputeUsage from '@domain/ComputeUsage'
import StorageUsage from '@domain/StorageUsage'

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

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
  ) {
    this.dataBaseName = configLoader().AWS.ATHENA_DB_NAME
    this.tableName = configLoader().AWS.ATHENA_DB_TABLE
    this.queryResultsLocation = configLoader().AWS.ATHENA_QUERY_RESULT_LOCATION
    this.athena = new AWSAthena()
  }
  async getEstimates(start: Date, end: Date): Promise<MutableEstimationResult[]> {
    const usageRows = await this.getUsage(start, end)
    const usageRowsHeader: QueryResultsRow = usageRows.shift()

    const serviceNameIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_product_code')
    const usageTypeIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_usage_type')
    const accountIdIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_usage_account_id')
    const vcpuIndex = getIndexOfObjectByValue(usageRowsHeader, 'product_vcpu')
    const usageAmountIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_usage_amount')
    const regionIndex = getIndexOfObjectByValue(usageRowsHeader, 'product_region')
    const pricingUnitIndex = getIndexOfObjectByValue(usageRowsHeader, 'pricing_unit')
    const usageStartTimeIndex = getIndexOfObjectByValue(usageRowsHeader, 'line_item_usage_start_date')

    const results: MutableEstimationResult[] = []

    usageRows.map((row: QueryResultsRow) => {
      const rowValues = Object.values(row.Data)
      const region = rowValues[regionIndex].VarCharValue
      const timestamp = new Date(rowValues[usageStartTimeIndex].VarCharValue.substr(0, 10))
      const serviceName = rowValues[serviceNameIndex].VarCharValue
      const usageType = rowValues[usageTypeIndex].VarCharValue
      const accountName = rowValues[accountIdIndex].VarCharValue
      const usageAmount = Number(rowValues[usageAmountIndex].VarCharValue)
      const numberOfvCPUHours = Number(rowValues[vcpuIndex].VarCharValue) * usageAmount
      const pricingUnit = rowValues[pricingUnitIndex].VarCharValue

      const footprintEstimate = this.getEstimateByPricingUnit(
        pricingUnit,
        timestamp,
        numberOfvCPUHours,
        usageAmount,
        region,
      )

      const serviceEstimate: MutableServiceEstimate = {
        cloudProvider: 'AWS',
        wattHours: footprintEstimate.wattHours,
        co2e: footprintEstimate.co2e,
        usesAverageCPUConstant: footprintEstimate.usesAverageCPUConstant,
        serviceName: this.getServiceNameFromUsageType(serviceName, usageType),
        accountName: accountName,
        region: region,
        cost: 0,
      }

      if (this.dayExistsInEstimates(results, timestamp)) {
        let estimatesForDay = results.find((estimate) => estimate.timestamp.getTime() === timestamp.getTime())

        if (this.estimateExistsForRegionAndService(results, timestamp, serviceEstimate)) {
          let estimateToAcc = estimatesForDay.serviceEstimates.find((estimateForDay) => {
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
  ) {
    switch (pricingUnit) {
      case 'Hrs':
        const computeUsage: ComputeUsage = {
          timestamp: timestamp,
          cpuUtilizationAverage: 50,
          numberOfvCpus: numberOfvCPUHours,
          usesAverageCPUConstant: true,
        }
        return this.computeEstimator.estimate([computeUsage], region, 'AWS')[0]
      case 'GB':
      case 'GB-Mo':
      case 'Terabytes':
        const storageUsage: StorageUsage = {
          timestamp: timestamp,
          sizeGb: this.convertToGigabytes(pricingUnit, usageAmount, timestamp),
        }
        const estimate: FootprintEstimate = this.hddStorageEstimator.estimate([storageUsage], region)[0]
        estimate.usesAverageCPUConstant = false
        return estimate
    }
  }

  private dayExistsInEstimates(results: MutableEstimationResult[], timestamp: Date): boolean {
    return results.some((estimate) => estimate.timestamp.getTime() === timestamp.getTime())
  }

  private estimateExistsForRegionAndService(
    results: MutableEstimationResult[],
    timestamp: Date,
    serviceEstimate: MutableServiceEstimate,
  ): boolean {
    let estimatesForDay = results.find((estimate) => estimate.timestamp.getTime() === timestamp.getTime())
    return estimatesForDay.serviceEstimates.some((estimateForDay) => {
      return this.hasSameRegionAndService(estimateForDay, serviceEstimate)
    })
  }

  private hasSameRegionAndService(estimateOne: MutableServiceEstimate, estimateTwo: MutableServiceEstimate): boolean {
    return estimateOne.region === estimateTwo.region && estimateOne.serviceName === estimateTwo.serviceName
  }

  private convertToGigabytes(pricingUnit: string, usageAmount: number, timestamp: Date): number {
    switch (pricingUnit) {
      case 'GB':
        return usageAmount
      case 'GB-Mo':
        return usageAmount * moment(timestamp).daysInMonth()
      case 'Terabytes':
        return usageAmount * 1000
      default:
        return 0
    }
  }

  private getServiceNameFromUsageType(serviceName: string, usageType: string): string {
    if (serviceName === 'AmazonEC2') {
      return usageType.includes('BoxUsage') ? 'EC2' : 'EBS'
    }
    return serviceName
  }

  private async getUsage(start: Date, end: Date): Promise<any[]> {
    const params = {
      QueryString: `SELECT line_item_product_code,
                    line_item_usage_type,
                    line_item_usage_account_id,
                    line_item_usage_amount,
                    product_instance_type,
                    product_region,
                    product_vcpu,
                    pricing_unit,
                    line_item_usage_start_date,
                    line_item_usage_end_date
                FROM ${this.tableName}
                WHERE line_item_line_item_type = 'Usage'
                AND pricing_unit IN ('Hrs', 'GB-Mo', 'GB', 'Terabytes', 'seconds')
                AND line_item_usage_start_date >= DATE(${moment(start).format('YYYY-MM-DD')})
                AND line_item_usage_end_date <= DATE(${moment(end).format('YYYY-MM-DD')})`,
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
    const response: StartQueryExecutionOutput = await this.athena.startQueryExecution(params).promise()
    const queryExecutionData = {
      QueryExecutionId: response.QueryExecutionId,
    }

    while (true) {
      const queryExecutionResults: GetQueryExecutionOutput = await this.athena
        .getQueryExecution(queryExecutionData)
        .promise()
      if (queryExecutionResults.QueryExecution.Status.State === 'SUCCEEDED') break
      await wait(1000)
    }
    const results: GetQueryResultsOutput = await this.athena.getQueryResults(queryExecutionData).promise()
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
