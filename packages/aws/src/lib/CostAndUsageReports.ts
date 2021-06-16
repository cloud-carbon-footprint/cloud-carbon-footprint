/*
 * © 2021 ThoughtWorks, Inc.
 */
import moment from 'moment'
import { concat } from 'ramda'
import { Athena } from 'aws-sdk'
import {
  GetQueryExecutionInput,
  GetQueryExecutionOutput,
  GetQueryResultsOutput,
  StartQueryExecutionInput,
  StartQueryExecutionOutput,
  Row,
} from 'aws-sdk/clients/athena'

import {
  configLoader,
  Logger,
  EstimationResult,
} from '@cloud-carbon-footprint/common'

import {
  FootprintEstimate,
  MutableEstimationResult,
  ComputeEstimator,
  StorageEstimator,
  NetworkingEstimator,
  MemoryEstimator,
  ComputeUsage,
  StorageUsage,
  NetworkingUsage,
  MemoryUsage,
  COMPUTE_PROCESSOR_TYPES,
  appendOrAccumulateEstimatesByDay,
  CloudConstantsEmissionsFactors,
  CloudConstants,
  calculateGigabyteHours,
  getPhysicalChips,
} from '@cloud-carbon-footprint/core'

import { ServiceWrapper } from './ServiceWrapper'
import {
  SSD_USAGE_TYPES,
  HDD_USAGE_TYPES,
  NETWORKING_USAGE_TYPES,
  BYTE_HOURS_USAGE_TYPES,
  SSD_SERVICES,
  PRICING_UNITS,
  UNKNOWN_USAGE_TYPES,
  LINE_ITEM_TYPES,
  AWS_QUERY_GROUP_BY,
} from './CostAndUsageTypes'
import CostAndUsageReportsRow from './CostAndUsageReportsRow'

import {
  BURSTABLE_INSTANCE_BASELINE_UTILIZATION,
  EC2_INSTANCE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  REDSHIFT_INSTANCE_TYPES,
} from './AWSInstanceTypes'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

export default class CostAndUsageReports {
  private readonly dataBaseName: string
  private readonly tableName: string
  private readonly queryResultsLocation: string
  private readonly costAndUsageReportsLogger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly memoryEstimator: MemoryEstimator,
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
      const costAndUsageReportRow = new CostAndUsageReportsRow(
        usageRowsHeader,
        rowData.Data,
      )

      if (
        this.usageTypeIsUnknown(
          costAndUsageReportRow.usageType,
          costAndUsageReportRow.serviceName,
        )
      )
        return []

      const footprintEstimate = this.getEstimateByPricingUnit(
        costAndUsageReportRow,
      )
      if (footprintEstimate)
        appendOrAccumulateEstimatesByDay(
          results,
          costAndUsageReportRow,
          footprintEstimate,
        )
    })
    return results
  }

  private getEstimateByPricingUnit(
    costAndUsageReportRow: CostAndUsageReportsRow,
  ): FootprintEstimate {
    const emissionsFactors: CloudConstantsEmissionsFactors =
      this.getEmissionsFactors()
    const powerUsageEffectiveness: number = this.getPowerUsageEffectiveness(
      costAndUsageReportRow.region,
    )
    switch (costAndUsageReportRow.usageUnit) {
      case PRICING_UNITS.HOURS_1:
      case PRICING_UNITS.HOURS_2:
      case PRICING_UNITS.HOURS_3:
      case PRICING_UNITS.VCPU_HOURS:
      case PRICING_UNITS.DPU_HOUR:
      case PRICING_UNITS.ACU_HOUR:
        // Compute / Memory
        const gigabyteHoursForMemoryUsage =
          this.getGigabytesFromInstanceTypeAndProcessors(
            costAndUsageReportRow.usageType,
            costAndUsageReportRow.usageAmount,
          )

        const computeFootprint = this.getComputeFootprintEstimate(
          costAndUsageReportRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )

        const memoryFootprint = this.getMemoryFootprintEstimate(
          costAndUsageReportRow,
          gigabyteHoursForMemoryUsage,
          powerUsageEffectiveness,
          emissionsFactors,
        )

        // if there exist any gigabytes to calculate memory usage,
        // add the kwh and co2e for both compute and memory
        if (gigabyteHoursForMemoryUsage) {
          return {
            timestamp: computeFootprint.timestamp,
            kilowattHours:
              computeFootprint.kilowattHours + memoryFootprint.kilowattHours,
            co2e: computeFootprint.co2e + memoryFootprint.co2e,
            usesAverageCPUConstant: computeFootprint.usesAverageCPUConstant,
          }
        }

        return computeFootprint
      case PRICING_UNITS.GB_MONTH_1:
      case PRICING_UNITS.GB_MONTH_2:
      case PRICING_UNITS.GB_MONTH_3:
      case PRICING_UNITS.GB_MONTH_4:
      case PRICING_UNITS.GB_HOURS:
        // Storage
        return this.getStorageFootprintEstimate(
          costAndUsageReportRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )
      case PRICING_UNITS.SECONDS_1:
      case PRICING_UNITS.SECONDS_2:
        // Lambda
        return this.getLambdaComputeFootprintEstimate(
          costAndUsageReportRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )
      case PRICING_UNITS.GB_1:
      case PRICING_UNITS.GB_2:
        // Networking
        return this.getNetworkingFootprintEstimate(
          costAndUsageReportRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )
      default:
        this.costAndUsageReportsLogger.warn(
          `Unexpected pricing unit: ${costAndUsageReportRow.usageUnit}`,
        )
    }
  }

  private getNetworkingFootprintEstimate(
    costAndUsageReportRow: CostAndUsageReportsRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ) {
    let networkingEstimate: FootprintEstimate
    if (this.usageTypeIsNetworking(costAndUsageReportRow)) {
      const networkingUsage: NetworkingUsage = {
        timestamp: costAndUsageReportRow.timestamp,
        gigabytes: costAndUsageReportRow.usageAmount,
      }
      const networkingConstants: CloudConstants = {
        powerUsageEffectiveness: powerUsageEffectiveness,
      }
      networkingEstimate = this.networkingEstimator.estimate(
        [networkingUsage],
        costAndUsageReportRow.region,
        emissionsFactors,
        networkingConstants,
      )[0]
    }
    if (networkingEstimate) networkingEstimate.usesAverageCPUConstant = false
    return networkingEstimate
  }

  private getStorageFootprintEstimate(
    costAndUsageReportRow: CostAndUsageReportsRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ) {
    const usageAmountTerabyteHours = this.getUsageAmountInTerabyteHours(
      costAndUsageReportRow,
    )

    const storageUsage: StorageUsage = {
      timestamp: costAndUsageReportRow.timestamp,
      terabyteHours: usageAmountTerabyteHours,
    }

    const storageConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(
        costAndUsageReportRow.usageType,
        costAndUsageReportRow.serviceName,
      ),
    }

    let estimate: FootprintEstimate
    if (this.usageTypeIsSSD(costAndUsageReportRow))
      estimate = this.ssdStorageEstimator.estimate(
        [storageUsage],
        costAndUsageReportRow.region,
        emissionsFactors,
        storageConstants,
      )[0]
    else if (this.usageTypeIsHDD(costAndUsageReportRow.usageType))
      estimate = this.hddStorageEstimator.estimate(
        [storageUsage],
        costAndUsageReportRow.region,
        emissionsFactors,
        storageConstants,
      )[0]
    else
      this.costAndUsageReportsLogger.warn(
        `Unexpected usage type for storage service: ${costAndUsageReportRow.usageType}`,
      )
    if (estimate) estimate.usesAverageCPUConstant = false
    return estimate
  }

  private getComputeFootprintEstimate(
    costAndUsageReportRow: CostAndUsageReportsRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const computeProcessors = this.getComputeProcessorsFromUsageType(
      costAndUsageReportRow.usageType,
    )

    const computeUsage: ComputeUsage = {
      timestamp: costAndUsageReportRow.timestamp,
      cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: costAndUsageReportRow.vCpuHours,
      usesAverageCPUConstant: true,
    }

    const computeConstants: CloudConstants = {
      minWatts: this.getMinwatts(computeProcessors),
      maxWatts: this.getMaxwatts(computeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(
        costAndUsageReportRow.usageType,
        costAndUsageReportRow.serviceName,
      ),
    }

    return this.computeEstimator.estimate(
      [computeUsage],
      costAndUsageReportRow.region,
      emissionsFactors,
      computeConstants,
    )[0]
  }

  private getMemoryFootprintEstimate(
    costAndUsageReportRow: CostAndUsageReportsRow,
    gigabyteHoursForMemoryUsage: number,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const memoryUsage: MemoryUsage = {
      timestamp: costAndUsageReportRow.timestamp,
      gigabyteHours: gigabyteHoursForMemoryUsage,
    }
    const memoryConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(
        costAndUsageReportRow.usageType,
        costAndUsageReportRow.serviceName,
      ),
    }

    return this.memoryEstimator.estimate(
      [memoryUsage],
      costAndUsageReportRow.region,
      emissionsFactors,
      memoryConstants,
    )[0]
  }

  private getLambdaComputeFootprintEstimate(
    costAndUsageReportRow: CostAndUsageReportsRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const computeProcessors = this.getComputeProcessorsFromUsageType(
      costAndUsageReportRow.usageType,
    )

    const lambdaComputeUsage: ComputeUsage = {
      timestamp: costAndUsageReportRow.timestamp,
      cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: costAndUsageReportRow.usageAmount / 3600,
      usesAverageCPUConstant: true,
    }

    const lambdaComputeConstants: CloudConstants = {
      minWatts: this.getMinwatts(computeProcessors),
      maxWatts: this.getMaxwatts(computeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
    }
    return this.computeEstimator.estimate(
      [lambdaComputeUsage],
      costAndUsageReportRow.region,
      emissionsFactors,
      lambdaComputeConstants,
    )[0]
  }

  private getComputeProcessorsFromUsageType(usageType: string): string[] {
    const instanceType = this.parseInstanceTypeFromUsageType(usageType)

    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private getGigabytesFromInstanceTypeAndProcessors(
    usageType: string,
    usageAmount: number,
  ): number {
    const instanceType = this.parseInstanceTypeFromUsageType(usageType)
    const [instanceFamily, instanceSize] = instanceType.split('.')

    // check to see if the instance type is contained in the AWSInstanceTypes lists
    // or if the instance type is not a burstable instance, otherwise return void
    const { isValidInstanceType, isBurstableInstance } =
      this.checkInstanceTypes(instanceFamily, instanceType)
    if (!isValidInstanceType || isBurstableInstance) return

    // grab the list of processors per instance type
    // and then the aws specific memory constant for the processors
    const processors = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
      instanceType
    ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
    const processorMemoryGigabytesPerPhysicalChip =
      AWS_CLOUD_CONSTANTS.getMemory(processors)

    // grab the instance type vcpu from the AWSInstanceTypes lists
    const instanceTypeMemory =
      EC2_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[1] ||
      REDSHIFT_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[1]

    // grab the entire instance family that the instance type is classified within
    const familyInstanceTypes: number[][] = Object.values(
      EC2_INSTANCE_TYPES[instanceFamily] ||
        REDSHIFT_INSTANCE_TYPES[instanceFamily],
    )

    // grab the vcpu and memory (gb) from the largest instance type in the family
    const [largestInstanceTypevCpus, largestInstanceTypeMemory] =
      familyInstanceTypes[familyInstanceTypes.length - 1]

    // there are special cases for instance families m5zn and z1d where they are always 2
    const physicalChips = ['m5zn', 'z1d'].includes(instanceFamily)
      ? 2
      : getPhysicalChips(largestInstanceTypevCpus)

    return calculateGigabyteHours(
      physicalChips,
      largestInstanceTypeMemory,
      processorMemoryGigabytesPerPhysicalChip,
      instanceTypeMemory,
      usageAmount,
    )
  }

  private checkInstanceTypes(instanceFamily: string, instanceType: string) {
    // a valid instance type is one that is mapped in the AWSInstanceTypes lists
    const isValidInstanceType =
      Object.keys(EC2_INSTANCE_TYPES).includes(instanceFamily) ||
      Object.keys(REDSHIFT_INSTANCE_TYPES).includes(instanceFamily)
    // we are not able to calculate memory usage for burstable (t family) instances
    // unlike other instance families, the largest t instance is not equal to a full machine
    const isBurstableInstance = Object.keys(
      BURSTABLE_INSTANCE_BASELINE_UTILIZATION,
    ).includes(instanceType)
    return { isValidInstanceType, isBurstableInstance }
  }

  private parseInstanceTypeFromUsageType(usageType: string) {
    const prefixes = ['db', 'cache', 'Kafka']
    const includesPrefix = prefixes.find((prefix) => usageType.includes(prefix))
    const instanceType = includesPrefix
      ? usageType.split(concat(includesPrefix, '.')).pop()
      : usageType.split(':').pop()
    return instanceType
  }

  private getUsageAmountInTerabyteHours(
    costAndUsageReportRow: CostAndUsageReportsRow,
  ): number {
    if (this.usageTypeisByteHours(costAndUsageReportRow.usageType)) {
      // Convert from Byte-Hours to Terabyte Hours
      return costAndUsageReportRow.usageAmount / 1099511627776
    }
    // Convert from GB-Hours to Terabyte Hours
    if (costAndUsageReportRow.usageUnit === PRICING_UNITS.GB_HOURS)
      return costAndUsageReportRow.usageAmount / 1000

    // Convert Gb-Month to Terabyte Hours
    const daysInMonth = moment(costAndUsageReportRow.timestamp).daysInMonth()
    return (costAndUsageReportRow.usageAmount / 1000) * (24 * daysInMonth)
  }

  private usageTypeIsSSD(costAndUsageRow: CostAndUsageReportsRow): boolean {
    // Here we have two potential SSD use cases:
    // 1. The usage type ends with a set of assumed SSD Storage types
    // 2. The usage is from a service we don't know the underlying storage type so overestimate and assume SSD,
    // but not when the usage type is backup, which we assume this is usage using S3 (which is HDD).
    return (
      this.endsWithAny(SSD_USAGE_TYPES, costAndUsageRow.usageType) ||
      (this.endsWithAny(SSD_SERVICES, costAndUsageRow.serviceName) &&
        !costAndUsageRow.usageType.includes('Backup'))
    )
  }

  private usageTypeIsHDD(usageType: string): boolean {
    return this.endsWithAny(HDD_USAGE_TYPES, usageType)
  }

  private usageTypeisByteHours(usageType: string): boolean {
    return this.endsWithAny(BYTE_HOURS_USAGE_TYPES, usageType)
  }

  private usageTypeIsNetworking(
    costAndUsageRow: CostAndUsageReportsRow,
  ): boolean {
    return (
      this.endsWithAny(NETWORKING_USAGE_TYPES, costAndUsageRow.usageType) &&
      costAndUsageRow.serviceName !== 'AmazonCloudFront'
    )
  }

  private usageTypeIsUnknown(usageType: string, serviceName: string): boolean {
    return (
      this.endsWithAny(UNKNOWN_USAGE_TYPES, usageType) ||
      UNKNOWN_USAGE_TYPES.some((unknownUsageType) =>
        usageType.includes(unknownUsageType),
      ) ||
      serviceName === 'AmazonSimpleDB'
    )
  }

  private getReplicationFactor(usageType: string, serviceName: string): number {
    switch (serviceName) {
      case 'AmazonS3':
        if (usageType.includes('STANDARD'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.S3_STANDARD // 3
        if (usageType.includes('SIA'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.S3_STANDARD_IA // 3
        if (usageType.includes('INT'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.S3_INTELLIGENT_TIERING // 3
        if (usageType.includes('GLACIER'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.S3_GLACIER // 3
        if (usageType.includes('GDA'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.S3_GLACIER_DEEP_ARCHIVE // 3
        if (usageType.includes('RRS'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.S3_REDUCED_REDUNDANCY // 3
        return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.S3 // 2
      case 'AmazonEC2':
        if (usageType.includes('EBS') && !usageType.includes('SnapshotUsage'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.EC2_EBS_VOLUME // 2
        break
      case 'AmazonEFS':
        return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.EFS // 2
      case 'AmazonRDS':
        if (usageType.includes('Aurora'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.RDS_AURORA // 6
        if (usageType.includes('Multi-AZ'))
          return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.RDS_MULTI_AZ // 2
        break
      case 'AmazonDocDB':
        return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.DOCUMENT_DB // 2
      case 'AmazonDynamoDB':
        return AWS_CLOUD_CONSTANTS.REPLICATION_FACTORS.DYNAMO_DB // 2
    }
  }

  private endsWithAny(suffixes: string[], string: string): boolean {
    return suffixes.some((suffix) => string.endsWith(suffix))
  }

  private getMinwatts(computeProcessors: string[]): number {
    return AWS_CLOUD_CONSTANTS.getMinWatts(computeProcessors)
  }

  private getMaxwatts(computeProcessors: string[]): number {
    return AWS_CLOUD_CONSTANTS.getMaxWatts(computeProcessors)
  }

  private getPowerUsageEffectiveness(region: string): number {
    return AWS_CLOUD_CONSTANTS.getPUE(region)
  }

  private getEmissionsFactors(): { [region: string]: number } {
    return AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
  }

  private async getUsage(start: Date, end: Date): Promise<Athena.Row[]> {
    const params = {
      QueryString: `SELECT DATE(DATE_TRUNC('${
        AWS_QUERY_GROUP_BY[configLoader().GROUP_QUERY_RESULTS_BY]
      }', line_item_usage_start_date)) AS timestamp,
                        line_item_usage_account_id as accountName,
                        product_region as region,
                        line_item_product_code as serviceName,
                        line_item_usage_type as usageType,
                        pricing_unit as usageUnit,
                        product_vcpu as vCpus,
                    SUM(line_item_usage_amount) as usageAmount,
                    SUM(line_item_blended_cost) as cost
                    FROM ${this.tableName}
                    WHERE line_item_line_item_type IN ('${LINE_ITEM_TYPES.join(
                      `', '`,
                    )}')
                    AND pricing_unit IN ('${Object.values(PRICING_UNITS).join(
                      `', '`,
                    )}')
                    AND line_item_usage_start_date >= DATE('${moment
                      .utc(start)
                      .format('YYYY-MM-DD')}')
                    AND line_item_usage_end_date <= DATE('${moment
                      .utc(end)
                      .format('YYYY-MM-DD')}')
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

  private async startQuery(
    queryParams: StartQueryExecutionInput,
  ): Promise<StartQueryExecutionOutput> {
    let response: StartQueryExecutionOutput
    try {
      response = await this.serviceWrapper.startAthenaQueryExecution(
        queryParams,
      )
    } catch (e) {
      throw new Error(`Athena start query failed. Reason ${e.message}.`)
    }
    return response
  }

  private async getQueryResultSetRows(
    queryExecutionInput: GetQueryExecutionInput,
  ) {
    while (true) {
      const queryExecutionResults: GetQueryExecutionOutput =
        await this.serviceWrapper.getAthenaQueryExecution(queryExecutionInput)
      const queryStatus = queryExecutionResults.QueryExecution.Status
      if (queryStatus.State === ('FAILED' || 'CANCELLED'))
        throw new Error(
          `Athena query failed. Reason ${queryStatus.StateChangeReason}. Query ID: ${queryExecutionInput.QueryExecutionId}`,
        )
      if (queryStatus.State === 'SUCCEEDED') break

      await wait(1000)
    }
    const results: GetQueryResultsOutput[] =
      await this.serviceWrapper.getAthenaQueryResultSets(queryExecutionInput)
    return results.flatMap((result) => result.ResultSet.Rows)
  }
}

async function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
