/*
 * © 2020 ThoughtWorks, Inc. All rights reserved.
 */

import { Athena } from 'aws-sdk'
import { EC2_INSTANCE_TYPES, MSK_INSTANCE_TYPES } from '@services/aws/AWSInstanceTypes'
import { EC2_USAGE_TYPES, PRICING_UNITS } from '@services/aws/CostAndUsageTypes'

export const SERVICE_NAME_MAPPING: { [usageType: string]: string } = {
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
  AmazonKinesisAnalytics: 'kinesis',
  AmazonCloudFront: 'cloudfront',
}

const GLUE_VCPUS_PER_USAGE = 4

export default class CostAndUsageReportsRow {
  readonly cloudProvider: string
  readonly region: string
  readonly timestamp: Date
  readonly productCode: string
  readonly serviceName: string
  readonly accountName: string
  readonly usageAmount: number
  readonly usageType: string
  readonly vCpuHours: number
  readonly pricingUnit: string
  readonly cost: number

  constructor(usageRowsHeader: Athena.Row, rowData: Athena.datumList) {
    this.cloudProvider = 'AWS'
    this.region = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'product_region')].VarCharValue
    this.timestamp = new Date(rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'day')].VarCharValue)
    this.productCode = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'line_item_product_code')].VarCharValue
    this.usageType = rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'line_item_usage_type')].VarCharValue
    this.accountName =
      rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'line_item_usage_account_id')].VarCharValue
    this.usageAmount = Number(
      rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'total_line_item_usage_amount')].VarCharValue,
    )
    this.pricingUnit = this.getPricingUnit(rowData, usageRowsHeader)
    this.serviceName = this.getServiceNameFromUsageType(this.productCode, this.usageType)
    this.vCpuHours = this.getVCpuHours(
      this.usageAmount,
      this.serviceName,
      Number(rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'product_vcpu')].VarCharValue),
    )
    this.cost = Number(rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'total_cost')].VarCharValue)
  }

  private getPricingUnit(rowData: Athena.datumList, usageRowsHeader: Athena.Row) {
    if (this.usageType.includes('Fargate-GB-Hours')) return PRICING_UNITS.GB_HOURS
    return rowData[this.getIndexOfValueInRowData(usageRowsHeader, 'pricing_unit')].VarCharValue
  }

  private getVCpuHours(usageAmount: number, serviceName: string, vCpuFromReport: number) {
    // When the service is AWS Glue, 4 virtual CPUs are provisioned (from AWS Docs).
    if (serviceName === SERVICE_NAME_MAPPING.AWSGlue) return GLUE_VCPUS_PER_USAGE * usageAmount
    if (this.includesAny(['Fargate-vCPU-Hours', 'vCPU-Hours', 'CPUCredits'], this.usageType)) return usageAmount
    if (!vCpuFromReport) return this.extractVCpuFromInstanceType() * usageAmount
    return vCpuFromReport * usageAmount
  }

  private extractVCpuFromInstanceType() {
    if (this.usageType.includes('Kafka')) return MSK_INSTANCE_TYPES[`Kafka${this.usageType.split('Kafka').pop()}`]
    return EC2_INSTANCE_TYPES[this.usageType.split(':').pop()]
  }

  private getIndexOfValueInRowData(data: Athena.Row, value: string): number {
    return data.Data.map((item: Athena.Datum) => item.VarCharValue).indexOf(value)
  }

  private getServiceNameFromUsageType(serviceName: string, usageType: string): string {
    if (serviceName === 'AmazonEC2') {
      return this.includesAny(EC2_USAGE_TYPES, usageType) ? 'ec2' : 'ebs'
    }
    return SERVICE_NAME_MAPPING[serviceName] ? SERVICE_NAME_MAPPING[serviceName] : serviceName
  }

  private includesAny(substrings: string[], usageType: string) {
    return substrings.some((substring) => usageType.includes(substring))
  }
}
