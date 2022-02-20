/*
 * © 2021 Thoughtworks, Inc.
 */
import moment from 'moment'
import { Athena } from 'aws-sdk'
import {
  GetQueryExecutionInput,
  GetQueryExecutionOutput,
  GetQueryResultsOutput,
  Row,
  StartQueryExecutionInput,
  StartQueryExecutionOutput,
} from 'aws-sdk/clients/athena'

import {
  configLoader,
  containsAny,
  convertBytesToTerabytes,
  convertGigabyteHoursToTerabyteHours,
  convertGigabyteMonthsToTerabyteHours,
  endsWithAny,
  EstimationResult,
  LookupTableInput,
  LookupTableOutput,
  Logger,
  wait,
  GroupBy,
} from '@cloud-carbon-footprint/common'

import {
  AccumulateKilowattHoursBy,
  accumulateKilowattHours,
  appendOrAccumulateEstimatesByDay,
  CloudConstants,
  CloudConstantsEmissionsFactors,
  ComputeEstimator,
  EmbodiedEmissionsEstimator,
  EmbodiedEmissionsUsage,
  FootprintEstimate,
  MemoryEstimator,
  MutableEstimationResult,
  NetworkingEstimator,
  NetworkingUsage,
  StorageEstimator,
  StorageUsage,
  UnknownEstimator,
  UnknownUsage,
} from '@cloud-carbon-footprint/core'

import { ServiceWrapper } from './ServiceWrapper'
import {
  AWS_QUERY_GROUP_BY,
  BYTE_HOURS_USAGE_TYPES,
  HDD_USAGE_TYPES,
  KNOWN_USAGE_UNITS,
  LINE_ITEM_TYPES,
  NETWORKING_USAGE_TYPES,
  SSD_SERVICES,
  SSD_USAGE_TYPES,
  UNKNOWN_USAGE_TYPES,
  UNSUPPORTED_USAGE_TYPES,
} from './CostAndUsageTypes'
import CostAndUsageReportsRow from './CostAndUsageReportsRow'

import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import AWSComputeEstimatesBuilder from './AWSComputeEstimatesBuilder'
import AWSMemoryEstimatesBuilder from './AWSMemoryEstimatesBuilder'
import {
  EC2_INSTANCE_TYPES,
  GPU_INSTANCES_TYPES,
  INSTANCE_FAMILY_TO_INSTANCE_TYPE_MAPPING,
} from './AWSInstanceTypes'

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
    private readonly unknownEstimator: UnknownEstimator,
    private readonly embodiedEmissionsEstimator: EmbodiedEmissionsEstimator,
    private readonly serviceWrapper?: ServiceWrapper,
  ) {
    this.dataBaseName = configLoader().AWS.ATHENA_DB_NAME
    this.tableName = configLoader().AWS.ATHENA_DB_TABLE
    this.queryResultsLocation = configLoader().AWS.ATHENA_QUERY_RESULT_LOCATION
    this.costAndUsageReportsLogger = new Logger('CostAndUsageReports')
  }
  async getEstimates(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    const usageRows = await this.getUsage(start, end, grouping)
    const usageRowsHeader: Row = usageRows.shift()

    const results: MutableEstimationResult[] = []
    const unknownRows: CostAndUsageReportsRow[] = []

    usageRows.map((rowData: Row) => {
      const costAndUsageReportRow = new CostAndUsageReportsRow(
        usageRowsHeader,
        rowData.Data,
      )

      const footprintEstimate = this.getFootprintEstimateFromUsageRow(
        costAndUsageReportRow,
        unknownRows,
      )
      if (footprintEstimate)
        appendOrAccumulateEstimatesByDay(
          results,
          costAndUsageReportRow,
          footprintEstimate,
          grouping,
        )
    })

    if (results.length > 0) {
      unknownRows.map((rowData: CostAndUsageReportsRow) => {
        const footprintEstimate = this.getEstimateForUnknownUsage(rowData)
        if (footprintEstimate)
          appendOrAccumulateEstimatesByDay(
            results,
            rowData,
            footprintEstimate,
            grouping,
          )
      })
    }
    return results
  }

  getEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): LookupTableOutput[] {
    const result: LookupTableOutput[] = []
    const unknownRows: CostAndUsageReportsRow[] = []

    inputData.map((inputDataRow: LookupTableInput) => {
      const usageRowsHeader = {
        Data: [
          { VarCharValue: 'timestamp' },
          { VarCharValue: 'accountName' },
          { VarCharValue: 'serviceName' },
          { VarCharValue: 'region' },
          { VarCharValue: 'usageType' },
          { VarCharValue: 'usageUnit' },
          { VarCharValue: 'vCpus' },
          { VarCharValue: 'cost' },
          { VarCharValue: 'usageAmount' },
        ],
      }
      const usageRowData = [
        { VarCharValue: '' },
        { VarCharValue: '' },
        { VarCharValue: inputDataRow.serviceName },
        { VarCharValue: inputDataRow.region },
        { VarCharValue: inputDataRow.usageType },
        { VarCharValue: inputDataRow.usageUnit },
        { VarCharValue: inputDataRow.vCpus },
        { VarCharValue: '1' },
        { VarCharValue: '1' },
      ]
      const costAndUsageReportRow = new CostAndUsageReportsRow(
        usageRowsHeader,
        usageRowData,
      )

      const footprintEstimate = this.getFootprintEstimateFromUsageRow(
        costAndUsageReportRow,
        unknownRows,
      )

      if (footprintEstimate) {
        result.push({
          serviceName: inputDataRow.serviceName,
          region: inputDataRow.region,
          usageType: inputDataRow.usageType,
          usageUnit: inputDataRow.usageUnit,
          vCpus: inputDataRow.vCpus,
          kilowattHours: footprintEstimate.kilowattHours,
          co2e: footprintEstimate.co2e,
        })
      }
    })

    if (result.length > 0) {
      unknownRows.map((inputDataRow: CostAndUsageReportsRow) => {
        const footprintEstimate = this.getEstimateForUnknownUsage(inputDataRow)
        if (footprintEstimate)
          result.push({
            serviceName: inputDataRow.serviceName,
            region: inputDataRow.region,
            usageType: inputDataRow.usageType,
            usageUnit: inputDataRow.usageUnit,
            vCpus: inputDataRow.vCpus,
            kilowattHours: footprintEstimate.kilowattHours,
            co2e: footprintEstimate.co2e,
          })
      })
    }

    return result
  }

  private getFootprintEstimateFromUsageRow(
    costAndUsageReportRow: CostAndUsageReportsRow,
    unknownRows: CostAndUsageReportsRow[],
  ): FootprintEstimate | void {
    if (this.usageTypeIsUnsupported(costAndUsageReportRow.usageType)) return

    if (
      this.usageTypeIsUnknown(costAndUsageReportRow.usageType) ||
      this.usageUnitIsUnknown(costAndUsageReportRow.usageUnit) ||
      this.usageTypeisGpu(costAndUsageReportRow.usageType)
    ) {
      unknownRows.push(costAndUsageReportRow)
      return
    }

    return this.getEstimateByUsageUnit(costAndUsageReportRow)
  }

  private getEstimateByUsageUnit(
    costAndUsageReportRow: CostAndUsageReportsRow,
  ): FootprintEstimate {
    const emissionsFactors: CloudConstantsEmissionsFactors =
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
    const powerUsageEffectiveness: number = AWS_CLOUD_CONSTANTS.getPUE(
      costAndUsageReportRow.region,
    )
    switch (costAndUsageReportRow.usageUnit) {
      case KNOWN_USAGE_UNITS.HOURS_1:
      case KNOWN_USAGE_UNITS.HOURS_2:
      case KNOWN_USAGE_UNITS.HOURS_3:
      case KNOWN_USAGE_UNITS.VCPU_HOURS:
      case KNOWN_USAGE_UNITS.DPU_HOUR:
      case KNOWN_USAGE_UNITS.ACU_HOUR:
        // Compute / Memory

        const computeFootprint = new AWSComputeEstimatesBuilder(
          costAndUsageReportRow,
          this.computeEstimator,
        ).computeFootprint

        const memoryFootprint = new AWSMemoryEstimatesBuilder(
          costAndUsageReportRow,
          this.memoryEstimator,
        ).memoryFootprint

        const embodiedEmissions = this.getEmbodiedEmissions(
          costAndUsageReportRow,
          emissionsFactors,
        )

        if (isNaN(computeFootprint.kilowattHours)) {
          this.costAndUsageReportsLogger.warn(
            `Could not estimate compute usage for usage type: ${costAndUsageReportRow.usageType}`,
          )
          return {
            timestamp: computeFootprint.timestamp,
            kilowattHours: 0,
            co2e: computeFootprint.co2e,
            usesAverageCPUConstant: computeFootprint.usesAverageCPUConstant,
          }
        }

        // if there exist any memory footprint or embodied emissions,
        // add the kwh and co2e for all compute,  memory, and embodied emissions
        if (memoryFootprint.co2e || embodiedEmissions.co2e) {
          const kilowattHours =
            computeFootprint.kilowattHours +
            memoryFootprint.kilowattHours +
            embodiedEmissions.kilowattHours
          accumulateKilowattHours(
            AWS_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
            costAndUsageReportRow,
            kilowattHours,
            AccumulateKilowattHoursBy.COST,
          )
          return {
            timestamp: computeFootprint.timestamp,
            kilowattHours: kilowattHours,
            co2e:
              computeFootprint.co2e +
              memoryFootprint.co2e +
              embodiedEmissions.co2e,
            usesAverageCPUConstant: computeFootprint.usesAverageCPUConstant,
          }
        }

        if (computeFootprint)
          accumulateKilowattHours(
            AWS_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
            costAndUsageReportRow,
            computeFootprint.kilowattHours,
            AccumulateKilowattHoursBy.COST,
          )

        return computeFootprint
      case KNOWN_USAGE_UNITS.GB_MONTH_1:
      case KNOWN_USAGE_UNITS.GB_MONTH_2:
      case KNOWN_USAGE_UNITS.GB_MONTH_3:
      case KNOWN_USAGE_UNITS.GB_MONTH_4:
      case KNOWN_USAGE_UNITS.GB_HOURS:
        // Storage
        return this.getStorageFootprintEstimate(
          costAndUsageReportRow,
          powerUsageEffectiveness,
          emissionsFactors,
        )
      case KNOWN_USAGE_UNITS.SECONDS_1:
      case KNOWN_USAGE_UNITS.SECONDS_2:
        // Lambda
        costAndUsageReportRow.vCpuHours =
          costAndUsageReportRow.usageAmount / 3600
        return new AWSComputeEstimatesBuilder(
          costAndUsageReportRow,
          this.computeEstimator,
        ).computeFootprint
      case KNOWN_USAGE_UNITS.GB_1:
      case KNOWN_USAGE_UNITS.GB_2:
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
        return {
          timestamp: new Date(),
          kilowattHours: 0,
          co2e: 0,
          usesAverageCPUConstant: false,
        }
    }
  }

  private getEstimateForUnknownUsage(
    rowData: CostAndUsageReportsRow,
  ): FootprintEstimate {
    const unknownUsage: UnknownUsage = {
      timestamp: rowData.timestamp,
      cost: rowData.cost,
      usageUnit: rowData.usageUnit,
    }
    const unknownConstants: CloudConstants = {
      kilowattHoursByServiceAndUsageUnit:
        AWS_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
    }
    return this.unknownEstimator.estimate(
      [unknownUsage],
      rowData.region,
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      unknownConstants,
    )[0]
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
    if (networkingEstimate) {
      networkingEstimate.usesAverageCPUConstant = false
      accumulateKilowattHours(
        AWS_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        costAndUsageReportRow,
        networkingEstimate.kilowattHours,
        AccumulateKilowattHoursBy.COST,
      )
    }
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
      replicationFactor: costAndUsageReportRow.replicationFactor,
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
        `Unexpected usage type for storage estimation. Usage type: ${costAndUsageReportRow.usageType}`,
      )
    if (estimate) {
      estimate.usesAverageCPUConstant = false
      accumulateKilowattHours(
        AWS_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        costAndUsageReportRow,
        estimate.kilowattHours,
        AccumulateKilowattHoursBy.COST,
      )
    }
    return estimate
  }

  private getUsageAmountInTerabyteHours(
    costAndUsageReportRow: CostAndUsageReportsRow,
  ): number {
    if (this.usageTypeisByteHours(costAndUsageReportRow.usageType)) {
      // Convert from Byte-Hours to Terabyte Hours
      return convertBytesToTerabytes(costAndUsageReportRow.usageAmount)
    }
    // Convert from GB-Hours to Terabyte Hours
    if (costAndUsageReportRow.usageUnit === KNOWN_USAGE_UNITS.GB_HOURS) {
      return convertGigabyteHoursToTerabyteHours(
        costAndUsageReportRow.usageAmount,
      )
    }

    // Convert Gb-Month to Terabyte Hours
    return convertGigabyteMonthsToTerabyteHours(
      costAndUsageReportRow.usageAmount,
      costAndUsageReportRow.timestamp,
    )
  }

  private usageTypeIsSSD(costAndUsageRow: CostAndUsageReportsRow): boolean {
    // Here we have two potential SSD use cases:
    // 1. The usage type ends with a set of assumed SSD Storage types
    // 2. The usage is from a service we don't know the underlying storage type so overestimate and assume SSD,
    // but not when the usage type is backup, which we assume this is usage using S3 (which is HDD).
    return (
      endsWithAny(SSD_USAGE_TYPES, costAndUsageRow.usageType) ||
      (endsWithAny(SSD_SERVICES, costAndUsageRow.serviceName) &&
        !costAndUsageRow.usageType.includes('Backup'))
    )
  }

  private usageTypeIsHDD(usageType: string): boolean {
    return endsWithAny(HDD_USAGE_TYPES, usageType)
  }

  private usageTypeisByteHours(usageType: string): boolean {
    return endsWithAny(BYTE_HOURS_USAGE_TYPES, usageType)
  }

  private usageTypeIsNetworking(
    costAndUsageRow: CostAndUsageReportsRow,
  ): boolean {
    return (
      endsWithAny(NETWORKING_USAGE_TYPES, costAndUsageRow.usageType) &&
      costAndUsageRow.serviceName !== 'AmazonCloudFront'
    )
  }

  private usageTypeIsUnsupported(usageType: string): boolean {
    return (
      endsWithAny(UNSUPPORTED_USAGE_TYPES, usageType) ||
      UNSUPPORTED_USAGE_TYPES.some((unsupportedUsageType) =>
        usageType.includes(unsupportedUsageType),
      )
    )
  }

  private usageTypeIsUnknown(usageType: string): boolean {
    return (
      endsWithAny(UNKNOWN_USAGE_TYPES, usageType) ||
      UNKNOWN_USAGE_TYPES.some((unknownUsageType) =>
        usageType.includes(unknownUsageType),
      )
    )
  }

  private usageUnitIsUnknown(usageUnit: string): boolean {
    return !Object.values(KNOWN_USAGE_UNITS).some(
      (knownUsageUnit) => knownUsageUnit === usageUnit,
    )
  }

  private usageTypeisGpu(usageType: string): boolean {
    return containsAny(GPU_INSTANCES_TYPES, usageType)
  }

  private async getUsage(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<Athena.Row[]> {
    const params = {
      QueryString: `SELECT DATE(DATE_TRUNC('${
        AWS_QUERY_GROUP_BY[grouping]
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

  private getEmbodiedEmissions(
    costAndUsageReportRow: CostAndUsageReportsRow,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ) {
    const { instancevCpu, scopeThreeEmissions, largestInstancevCpu } =
      this.getDataFromInstanceType(costAndUsageReportRow.instanceType)

    if (!instancevCpu || !scopeThreeEmissions || !largestInstancevCpu)
      return {
        timestamp: undefined,
        kilowattHours: 0,
        co2e: 0,
      }

    const embodiedEmissionsUsage: EmbodiedEmissionsUsage = {
      instancevCpu,
      largestInstancevCpu,
      usageTimePeriod: costAndUsageReportRow.usageAmount / instancevCpu,
      scopeThreeEmissions,
    }

    return this.embodiedEmissionsEstimator.estimate(
      [embodiedEmissionsUsage],
      costAndUsageReportRow.region,
      emissionsFactors,
    )[0]
  }

  private getDataFromInstanceType(instanceType: string): {
    [key: string]: number
  } {
    const instanceTypeDetails = instanceType.split('.')
    const instanceSize = instanceTypeDetails[instanceTypeDetails.length - 1]
    const instanceFamily = instanceTypeDetails[instanceTypeDetails.length - 2]

    if (!instanceSize || !instanceFamily) {
      return {
        instancevCpu: 0,
        scopeThreeEmissions: 0,
        largestInstancevCpu: 0,
      }
    }

    const instancevCpu =
      EC2_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[0] ||
      INSTANCE_FAMILY_TO_INSTANCE_TYPE_MAPPING[instanceFamily]?.[
        instanceSize
      ]?.[0]

    const scopeThreeEmissions =
      EC2_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[2] ||
      INSTANCE_FAMILY_TO_INSTANCE_TYPE_MAPPING[instanceFamily]?.[
        instanceSize
      ]?.[1]

    const familyInstanceTypes: number[][] = Object.values(
      EC2_INSTANCE_TYPES[instanceFamily] ||
        INSTANCE_FAMILY_TO_INSTANCE_TYPE_MAPPING[instanceFamily] ||
        {},
    )

    const [largestInstancevCpu] =
      familyInstanceTypes[familyInstanceTypes.length - 1] || []

    return {
      instancevCpu,
      scopeThreeEmissions,
      largestInstancevCpu,
    }
  }
}
