/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { Athena } from 'aws-sdk'

const SERVICE_NAME_MAPPING: { [usageType: string]: string } = {
  AWSLambda: 'lambda',
  AmazonRDS: 'rds',
  AmazonCloudWatch: 'cloudwatch',
  AmazonS3: 's3',
  AmazonMSK: 'msk',
  ElasticMapReduce: 'elasticmapreduce',
  AmazonGlacier: 'glacier',
  AmazonSageMaker: 'sageemaker',
  AmazonLightsail: 'lightsail',
  AWSDirectoryService: 'directoryservice',
  AWSIoTAnalytics: 'iotanalytics',
  AWSDatabaseMigrationSvc: 'databasemigrationsvc',
  AmazonES: 'es',
  AmazonQuickSight: 'quicksight',
  AmazonEFS: 'efs',
  AmazonRedshift: 'redshift',
  AmazonDynamoDB: 'dynamodb',
  datapipeline: 'datapipeline',
  AWSELB: 'elb',
  AmazonDocDB: 'docdb',
  AmazonSimpleDB: 'simpledb',
  AmazonECR: 'ecr',
  AmazonVPC: 'vpc',
  AmazonMQ: 'mq',
  AWSGlue: 'glue',
  AmazonECS: 'ecs',
}

export default class CostAndUsageReportsRow {
  readonly region: string
  readonly timestamp: Date
  readonly productCode: string
  readonly serviceName: string
  readonly accountId: string
  readonly usageAmount: number
  readonly usageType: string
  readonly vCpuHours: number
  readonly pricingUnit: string
  readonly cost: number

  constructor(usageRowsHeader: Athena.Row, rowData: Athena.datumList) {
    this.region = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'product_region')].VarCharValue
    this.timestamp = new Date(rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'day')].VarCharValue)
    this.productCode = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'line_item_product_code')].VarCharValue
    this.usageType = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'line_item_usage_type')].VarCharValue
    this.accountId = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'line_item_usage_account_id')].VarCharValue
    this.usageAmount = Number(
      rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'total_line_item_usage_amount')].VarCharValue,
    )
    this.pricingUnit = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'pricing_unit')].VarCharValue
    this.serviceName = this.getServiceNameFromUsageType(this.productCode, this.usageType)
    this.vCpuHours = this.getVCpuHours(
      this.usageAmount,
      this.serviceName,
      Number(rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'product_vcpu')].VarCharValue),
    )
    this.cost = Number(rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'total_cost')].VarCharValue)
  }

  private getVCpuHours(usageAmount: number, serviceName: string, vCpuFromReport: number) {
    return serviceName === SERVICE_NAME_MAPPING.AWSGlue ? 4 * usageAmount : vCpuFromReport * usageAmount
  }

  private getIndexOfValueInRowData(data: Athena.Row, value: string): number {
    return data.Data.map((item: Athena.Datum) => item.VarCharValue).indexOf(value)
  }

  private getServiceNameFromUsageType(serviceName: string, usageType: string): string {
    if (serviceName === 'AmazonEC2') {
      return usageType.includes('BoxUsage') ? 'ec2' : 'ebs'
    }
    return SERVICE_NAME_MAPPING[serviceName] ? SERVICE_NAME_MAPPING[serviceName] : serviceName
  }
}
