/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */
/* istanbul ignore file */
/* eslint-disable */
import moment from 'moment'
import { Athena as AWSAthena } from 'aws-sdk'
import ICloudService from '@domain/ICloudService'
import FootprintEstimate from '@domain/FootprintEstimate'
import Cost from '@domain/Cost'
import ComputeEstimator from '@domain/ComputeEstimator'
import { StorageEstimator } from '@domain/StorageEstimator'
import configLoader from '@application/ConfigLoader'
import { GetQueryExecutionOutput, GetQueryResultsOutput, StartQueryExecutionOutput } from 'aws-sdk/clients/athena'

export default class Athena implements ICloudService {
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
  async getEstimates(start: Date, end: Date): Promise<FootprintEstimate[]> {
    const usage = await this.getUsage(start, end)

    return usage
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

  async getCosts(start: Date, end: Date, region: string): Promise<Cost[]> {
    return []
  }
}

export function extractComputeUsageByRegion(queryResultData: any): any {
  const computeUsageData = queryResultData.filter((row: any) => row.Data[6].VarCharValue !== '')

  let result: any = {}

  computeUsageData.map((row: any) => {
    const rowData = row.Data
    const region = rowData[5].VarCharValue
    const rowUsage = {
      serviceName: rowData[0].VarCharValue,
      accountName: rowData[2].VarCharValue,
      usage: {
        timestamp: new Date(rowData[8].VarCharValue),
        cpuUtilizationAverage: 50,
        numberOfvCpus: rowData[3].VarCharValue * rowData[6].VarCharValue,
        usesAverageCPUConstant: true,
      },
    }
    if (region in result) {
      result[region].push(rowUsage)
    } else {
      result[region] = [rowUsage]
    }
  })

  return result
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
