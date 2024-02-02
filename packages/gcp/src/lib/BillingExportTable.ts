/*
 * © 2021 Thoughtworks, Inc.
 */

import moment from 'moment'
import { BigQuery, Job, RowMetadata } from '@google-cloud/bigquery'

import {
  configLoader,
  containsAny,
  convertByteSecondsToGigabyteHours,
  convertByteSecondsToTerabyteHours,
  convertBytesToGigabytes,
  EstimationResult,
  getEmissionsFactors,
  AccountDetailsOrIdList,
  GroupBy,
  Logger,
  LookupTableInput,
  LookupTableOutput,
  TagCollection,
  buildAccountFilter,
} from '@cloud-carbon-footprint/common'

import {
  accumulateKilowattHours,
  AccumulateKilowattHoursBy,
  appendOrAccumulateEstimatesByDay,
  CloudConstants,
  CloudConstantsEmissionsFactors,
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  ComputeUsage,
  EmbodiedEmissionsEstimator,
  EmbodiedEmissionsUsage,
  FootprintEstimate,
  MemoryEstimator,
  MemoryUsage,
  MutableEstimationResult,
  NetworkingEstimator,
  NetworkingUsage,
  StorageEstimator,
  StorageUsage,
  UnknownEstimator,
  UnknownUsage,
} from '@cloud-carbon-footprint/core'

import {
  COMPUTE_STRING_FORMATS,
  GCP_QUERY_GROUP_BY,
  MEMORY_USAGE_TYPES,
  NETWORKING_STRING_FORMATS,
  UNKNOWN_SERVICE_TYPES,
  UNKNOWN_USAGE_TYPES,
  UNKNOWN_USAGE_UNITS,
  UNSUPPORTED_USAGE_TYPES,
} from './BillingExportTypes'
import {
  GPU_MACHINE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING,
  MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING,
  N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING,
  SHARED_CORE_PROCESSORS,
} from './MachineTypes'
import BillingExportRow from './BillingExportRow'
import { GCP_CLOUD_CONSTANTS, getGCPEmissionsFactors } from '../domain'
import { GCP_REPLICATION_FACTORS_FOR_SERVICES } from './ReplicationFactors'
import { GCP_MAPPED_REGIONS_TO_ELECTRICITY_MAPS_ZONES } from './GCPRegions'

export default class BillingExportTable {
  private readonly tableName: string
  private readonly billingExportTableLogger: Logger

  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly ssdStorageEstimator: StorageEstimator,
    private readonly hddStorageEstimator: StorageEstimator,
    private readonly networkingEstimator: NetworkingEstimator,
    private readonly memoryEstimator: MemoryEstimator,
    private readonly unknownEstimator: UnknownEstimator,
    private readonly embodiedEmissionsEstimator: EmbodiedEmissionsEstimator,
    private readonly bigQuery?: BigQuery,
  ) {
    this.tableName = configLoader().GCP.BIG_QUERY_TABLE
    this.billingExportTableLogger = new Logger('BillingExportTable')
  }

  async getEstimates(
    start: Date,
    end: Date,
    grouping: GroupBy,
  ): Promise<EstimationResult[]> {
    const gcpConfig = configLoader().GCP
    const tagNames = gcpConfig.RESOURCE_TAG_NAMES
    const projects: AccountDetailsOrIdList = gcpConfig.projects
    const usageRows = await this.getUsage(
      start,
      end,
      grouping,
      tagNames,
      projects,
    )

    const results: MutableEstimationResult[] = []
    const unknownRows: BillingExportRow[] = []

    this.billingExportTableLogger.info('Mapping over Usage Rows')

    for (const usageRow of usageRows) {
      usageRow.tags = this.rawTagsToTagCollection(usageRow)
      const billingExportRow = new BillingExportRow(usageRow)

      const emissionsFactors: CloudConstantsEmissionsFactors =
        await getEmissionsFactors(
          billingExportRow.region,
          billingExportRow.timestamp.toISOString(),
          getGCPEmissionsFactors(),
          GCP_MAPPED_REGIONS_TO_ELECTRICITY_MAPS_ZONES,
          this.billingExportTableLogger,
        )

      const footprintEstimate = this.getFootprintEstimateFromUsageRow(
        billingExportRow,
        unknownRows,
        emissionsFactors,
      )
      if (footprintEstimate)
        appendOrAccumulateEstimatesByDay(
          results,
          billingExportRow,
          footprintEstimate,
          grouping,
          tagNames,
        )
    }

    if (results.length > 0) {
      unknownRows.map((rowData: BillingExportRow) => {
        const footprintEstimate = this.getEstimateForUnknownUsage(rowData)
        if (footprintEstimate)
          appendOrAccumulateEstimatesByDay(
            results,
            rowData,
            footprintEstimate,
            grouping,
            tagNames,
          )
      })
    }
    return results
  }

  async getEstimatesFromInputData(
    inputData: LookupTableInput[],
  ): Promise<LookupTableOutput[]> {
    const results: LookupTableOutput[] = []
    const unknownRows: BillingExportRow[] = []

    // inputData.map((inputDataRow: LookupTableInput) => {
    for (const inputDataRow of inputData) {
      const usageRow = {
        serviceName: inputDataRow.serviceName,
        usageAmount: 3600,
        usageType: inputDataRow.usageType,
        usageUnit: inputDataRow.usageUnit,
        cost: 1,
        region: inputDataRow.region,
        machineType: inputDataRow.machineType,
        timestamp: new Date(''),
      }

      const billingExportRow = new BillingExportRow(usageRow)

      // if there is a machineType. override vCpuHours value,
      // since it is set using usageAmount, which is always 1 for lookup table generation
      if (billingExportRow.machineType) {
        const { instancevCpu } = this.getDataFromMachineType(
          billingExportRow.machineType,
        )
        billingExportRow.vCpuHours = instancevCpu * billingExportRow.vCpuHours
      }

      const dateTime = new Date().toISOString()
      const emissionsFactors: CloudConstantsEmissionsFactors =
        await getEmissionsFactors(
          billingExportRow.region,
          dateTime,
          getGCPEmissionsFactors(),
          GCP_MAPPED_REGIONS_TO_ELECTRICITY_MAPS_ZONES,
          this.billingExportTableLogger,
        )

      const footprintEstimate = this.getFootprintEstimateFromUsageRow(
        billingExportRow,
        unknownRows,
        emissionsFactors,
      )
      if (footprintEstimate)
        results.push({
          serviceName: billingExportRow.serviceName,
          region: billingExportRow.region,
          usageType: billingExportRow.usageType,
          machineType: billingExportRow.machineType,
          kilowattHours: footprintEstimate.kilowattHours,
          co2e: footprintEstimate.co2e,
        })
    }

    if (results.length > 0) {
      unknownRows.map((billingExportRow: BillingExportRow) => {
        const footprintEstimate =
          this.getEstimateForUnknownUsage(billingExportRow)
        if (footprintEstimate)
          results.push({
            serviceName: billingExportRow.serviceName,
            region: billingExportRow.region,
            usageType: billingExportRow.usageType,
            machineType: billingExportRow.machineType,
            kilowattHours: footprintEstimate.kilowattHours,
            co2e: footprintEstimate.co2e,
          })
      })
    }
    return results
  }

  private getFootprintEstimateFromUsageRow(
    billingExportRow: BillingExportRow,
    unknownRows: BillingExportRow[],
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate | void {
    if (this.isUnsupportedUsage(billingExportRow.usageType)) return

    if (this.isUnknownUsage(billingExportRow)) {
      unknownRows.push(billingExportRow)
      return
    }

    return this.getEstimateByUsageUnit(
      billingExportRow,
      unknownRows,
      emissionsFactors,
    )
  }

  private getEstimateByUsageUnit(
    billingExportRow: BillingExportRow,
    unknownRows: BillingExportRow[],
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate | void {
    const powerUsageEffectiveness: number = GCP_CLOUD_CONSTANTS.getPUE(
      billingExportRow.region,
    )
    switch (billingExportRow.usageUnit) {
      case 'seconds':
        if (this.isComputeUsage(billingExportRow.usageType)) {
          const computeFootprint = this.getComputeFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )

          const embodiedEmissions = this.getEmbodiedEmissions(
            billingExportRow,
            emissionsFactors,
          )

          if (embodiedEmissions.co2e) {
            return {
              timestamp: computeFootprint.timestamp,
              kilowattHours:
                computeFootprint.kilowattHours +
                embodiedEmissions.kilowattHours,
              co2e: computeFootprint.co2e + embodiedEmissions.co2e,
              usesAverageCPUConstant: computeFootprint.usesAverageCPUConstant,
            }
          }

          return computeFootprint
        } else {
          unknownRows.push(billingExportRow)
        }
        break
      case 'byte-seconds':
        if (this.isMemoryUsage(billingExportRow.usageType)) {
          return this.getMemoryFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )
        } else {
          return this.getStorageFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )
        }
      case 'bytes':
        if (this.isNetworkingUsage(billingExportRow.usageType)) {
          return this.getNetworkingFootprintEstimate(
            billingExportRow,
            billingExportRow.timestamp,
            powerUsageEffectiveness,
            emissionsFactors,
          )
        } else {
          unknownRows.push(billingExportRow)
        }
        break
      default:
        this.billingExportTableLogger.warn(
          `Unsupported Usage unit: ${billingExportRow.usageUnit}`,
        )
        break
    }
  }

  private getComputeFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const isGPUComputeUsage = usageRow.usageType.includes('GPU')

    const computeUsage: ComputeUsage = {
      cpuUtilizationAverage: GCP_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: isGPUComputeUsage ? usageRow.gpuHours : usageRow.vCpuHours,
      usesAverageCPUConstant: true,
      timestamp,
    }
    let computeProcessors
    if (isGPUComputeUsage) {
      computeProcessors = this.getGpuComputeProcessorsFromUsageType(
        usageRow.usageType,
      )
    } else {
      computeProcessors = this.getComputeProcessorsFromMachineType(
        usageRow.machineType,
      )
    }

    const computeConstants: CloudConstants = {
      minWatts: GCP_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
      maxWatts: GCP_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(usageRow),
    }

    const computeFootprint = this.computeEstimator.estimate(
      [computeUsage],
      usageRow.region,
      emissionsFactors,
      computeConstants,
    )[0]

    if (computeFootprint)
      accumulateKilowattHours(
        GCP_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        usageRow,
        computeFootprint.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
      )

    return computeFootprint
  }

  private getComputeProcessorsFromMachineType(machineType: string): string[] {
    const sharedCoreMatch =
      machineType &&
      Object.values(SHARED_CORE_PROCESSORS).find((core) =>
        machineType.includes(core),
      )
    const includesPrefix = machineType?.substring(0, 2).toLowerCase()
    const processor = sharedCoreMatch ? sharedCoreMatch : includesPrefix

    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[processor] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  private getGpuComputeProcessorsFromUsageType(usageType: string): string[] {
    const gpuComputeProcessors = GPU_MACHINE_TYPES.filter((processor) =>
      usageType.startsWith(processor),
    )
    return gpuComputeProcessors.length
      ? gpuComputeProcessors
      : GPU_MACHINE_TYPES
  }

  private getEmbodiedEmissions(
    usageRow: BillingExportRow,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const { instancevCpu, scopeThreeEmissions, largestInstancevCpu } =
      this.getDataFromMachineType(usageRow.machineType)

    const embodiedEmissionsUsage: EmbodiedEmissionsUsage = {
      instancevCpu,
      largestInstancevCpu,
      usageTimePeriod: usageRow.usageAmount / instancevCpu / 3600,
      scopeThreeEmissions,
    }

    return this.embodiedEmissionsEstimator.estimate(
      [embodiedEmissionsUsage],
      usageRow.region,
      emissionsFactors,
    )[0]
  }

  private getDataFromMachineType(machineType: string): {
    [key: string]: number
  } {
    if (!machineType) {
      return {
        instancevCpu: 0,
        scopeThreeEmissions: 0,
        largestInstancevCpu: 0,
      }
    }

    const machineFamily = machineType?.split('-').slice(0, 2).join('-')
    const [machineFamilySharedCore] = machineType?.split('-')

    const instancevCpu =
      MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineFamily]?.[
        machineType
      ]?.[0] ||
      MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING[
        machineFamilySharedCore
      ]?.[machineType]?.[0] ||
      N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineType]?.[0]

    const scopeThreeEmissions =
      MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineFamily]?.[
        machineType
      ]?.[1] ||
      MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING[
        machineFamilySharedCore
      ]?.[machineType]?.[1] ||
      N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineType]?.[1]

    const familyMachineTypes: number[][] = Object.values(
      MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING[machineFamily] ||
        MACHINE_FAMILY_SHARED_CORE_TO_MACHINE_TYPE_MAPPING[
          machineFamilySharedCore
        ] ||
        N1_SHARED_CORE_MACHINE_FAMILY_TO_MACHINE_TYPE_MAPPING,
    )

    const largestInstancevCpu =
      familyMachineTypes[familyMachineTypes.length - 1][0]

    return {
      instancevCpu,
      scopeThreeEmissions,
      largestInstancevCpu,
    }
  }

  private getStorageFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    // storage estimation requires usage amount in terabyte hours
    const usageAmountTerabyteHours = convertByteSecondsToTerabyteHours(
      usageRow.usageAmount,
    )
    const storageUsage: StorageUsage = {
      timestamp,
      terabyteHours: usageAmountTerabyteHours,
    }
    const storageConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
      replicationFactor: this.getReplicationFactor(usageRow),
    }

    const storageEstimator = usageRow.usageType.includes('SSD')
      ? this.ssdStorageEstimator
      : this.hddStorageEstimator

    const storageFootprint = storageEstimator.estimate(
      [storageUsage],
      usageRow.region,
      emissionsFactors,
      storageConstants,
    )[0]

    if (storageFootprint) {
      storageFootprint.usesAverageCPUConstant = false
      accumulateKilowattHours(
        GCP_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        usageRow,
        storageFootprint.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
      )
    }

    return storageFootprint
  }

  private getMemoryFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const memoryUsage: MemoryUsage = {
      timestamp,
      gigabyteHours: convertByteSecondsToGigabyteHours(usageRow.usageAmount),
    }
    const memoryConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
    }

    const memoryFootprint = this.memoryEstimator.estimate(
      [memoryUsage],
      usageRow.region,
      emissionsFactors,
      memoryConstants,
    )[0]

    if (memoryFootprint) {
      memoryFootprint.usesAverageCPUConstant = false
      accumulateKilowattHours(
        GCP_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        usageRow,
        memoryFootprint.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
      )
    }

    return memoryFootprint
  }

  private getNetworkingFootprintEstimate(
    usageRow: BillingExportRow,
    timestamp: Date,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const networkingUsage: NetworkingUsage = {
      timestamp,
      gigabytes: convertBytesToGigabytes(usageRow.usageAmount),
    }
    const networkingConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness,
    }

    const networkingFootprint = this.networkingEstimator.estimate(
      [networkingUsage],
      usageRow.region,
      emissionsFactors,
      networkingConstants,
    )[0]

    if (networkingFootprint) {
      networkingFootprint.usesAverageCPUConstant = false
      accumulateKilowattHours(
        GCP_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
        usageRow,
        networkingFootprint.kilowattHours,
        AccumulateKilowattHoursBy.USAGE_AMOUNT,
      )
    }

    return networkingFootprint
  }

  private isUnknownUsage(usageRow: BillingExportRow): boolean {
    return (
      containsAny(UNKNOWN_USAGE_TYPES, usageRow.usageType) ||
      containsAny(UNKNOWN_SERVICE_TYPES, usageRow.serviceName) ||
      containsAny(UNKNOWN_USAGE_UNITS, usageRow.usageUnit) ||
      !usageRow.usageType
    )
  }

  private isMemoryUsage(usageType: string): boolean {
    // We only want to ignore memory usage that is not also compute usage (determined by containing VCPU usage)
    return (
      containsAny(MEMORY_USAGE_TYPES, usageType) &&
      !containsAny(COMPUTE_STRING_FORMATS, usageType)
    )
  }

  private isUnsupportedUsage(usageType: string): boolean {
    return containsAny(UNSUPPORTED_USAGE_TYPES, usageType)
  }

  private isComputeUsage(usageType: string): boolean {
    return containsAny(COMPUTE_STRING_FORMATS, usageType)
  }

  private isNetworkingUsage(usageType: string): boolean {
    return containsAny(NETWORKING_STRING_FORMATS, usageType)
  }

  private getReplicationFactor(usageRow: BillingExportRow): number {
    return (
      GCP_REPLICATION_FACTORS_FOR_SERVICES[usageRow.serviceName] &&
      GCP_REPLICATION_FACTORS_FOR_SERVICES[usageRow.serviceName](
        usageRow.usageType,
        usageRow.region,
      )
    )
  }

  private getEstimateForUnknownUsage(
    rowData: BillingExportRow,
  ): FootprintEstimate {
    const unknownUsage: UnknownUsage = {
      timestamp: rowData.timestamp,
      usageAmount: rowData.usageAmount,
      usageUnit: rowData.usageUnit,
      usageType: rowData.usageType,
      replicationFactor: this.getReplicationFactor(rowData),
    }
    const unknownConstants: CloudConstants = {
      kilowattHoursByServiceAndUsageUnit:
        GCP_CLOUD_CONSTANTS.KILOWATT_HOURS_BY_SERVICE_AND_USAGE_UNIT,
    }
    return this.unknownEstimator.estimate(
      [unknownUsage],
      rowData.region,
      getGCPEmissionsFactors(),
      unknownConstants,
    )[0]
  }

  /* Note about resource tags:
   * GCP supports three methods for labeling resources: tags (organization-level), project labels (project-level), and normal labels (resource-level).
   * We support all three under one config with the use of prefixes to specify the type of label that a key corresponds to.
   * The resulting key/value pairs are then merged into a single "tag" property for each resource.
   */
  private async getUsage(
    start: Date,
    end: Date,
    grouping: GroupBy,
    tagNames: string[],
    projects: AccountDetailsOrIdList,
  ): Promise<RowMetadata[]> {
    const startDate = new Date(
      moment.utc(start).startOf('day') as unknown as Date,
    )
    const endDate = new Date(moment.utc(end).endOf('day') as unknown as Date)

    const [tags, projectLabels, labels] = this.tagNamesToQueryColumns(tagNames)

    const [tagPropertySelections, tagPropertyJoins] = buildTagQuery(
      'tags',
      tags,
    )
    const [labelPropertySelections, labelPropertyJoins] = buildTagQuery(
      'labels',
      labels,
    )
    const [projectLabelPropertySelections, projectLabelPropertyJoins] =
      buildTagQuery('projectLabels', projectLabels)

    const projectFilter = this.buildProjectFilter(projects)

    const query = `SELECT DATE_TRUNC(DATE(usage_start_time), ${
      GCP_QUERY_GROUP_BY[grouping]
    }) as timestamp,
                    project.id as accountId,
                    project.name as accountName,
                    ifnull(location.region, location.location) as region,
                    service.description as serviceName,
                    sku.description as usageType,
                    usage.unit as usageUnit,
                    system_labels.value AS machineType,
                    SUM(usage.amount) AS usageAmount,
                    SUM(cost) AS cost ${tagPropertySelections} ${labelPropertySelections} ${projectLabelPropertySelections}
                   FROM
                           \`${this.tableName}\`
                       LEFT JOIN
                       UNNEST(system_labels) AS system_labels
                   ON system_labels.key = "compute.googleapis.com/machine_spec"
                       ${tagPropertyJoins}
                       ${labelPropertyJoins}
                       ${projectLabelPropertyJoins}
                   WHERE
                       cost_type != 'rounding_error'
                     AND usage.unit IN ('byte-seconds'
                       , 'seconds'
                       , 'bytes'
                       , 'requests')
                     AND usage_start_time BETWEEN TIMESTAMP ('${moment
                       .utc(startDate)
                       .format('YYYY-MM-DDTHH:mm:ssZ')}')
                     AND TIMESTAMP ('${moment
                       .utc(endDate)
                       .format('YYYY-MM-DDTHH:mm:ssZ')}') 
                     ${projectFilter}
                   GROUP BY
                       timestamp,
                       accountId,
                       accountName,
                       region,
                       serviceName,
                       usageType,
                       usageUnit,
                       machineType`

    const job: Job = await this.createQueryJob(query)
    return await this.getQueryResults(job)
  }

  private async getQueryResults(job: Job) {
    let rows: RowMetadata
    try {
      this.billingExportTableLogger.info('Getting Big Query Results')
      ;[rows] = await job.getQueryResults()
    } catch (e) {
      const { reason, domain, message } = e.errors[0]
      throw new Error(
        `BigQuery get Query Results failed. Reason: ${reason}, Domain: ${domain}, Message: ${message}`,
      )
    }
    return rows
  }

  private async createQueryJob(query: string) {
    let job: Job
    try {
      ;[job] = await this.bigQuery.createQueryJob({ query })
    } catch (e) {
      let errorMessage = e
      if (e.errors) {
        const { reason, location, message } = e.errors[0]
        errorMessage = `${reason}, Location: ${location}, Message: ${message}`
      }
      throw new Error(
        `BigQuery create Query Job failed. Reason: ${errorMessage}`,
      )
    }
    return job
  }

  private tagNamesToQueryColumns(tagNames: string[]): string[][] {
    const tagColumns: { [column: string]: string[] } = {
      tag: [],
      project: [],
      label: [],
    }

    if (!tagNames || !Array.isArray(tagNames)) {
      this.billingExportTableLogger.warn(
        'Configured list of tags is invalid. Tags must be a list of strings. Ignoring tags...',
      )
      return Object.values(tagColumns)
    }

    // For each string in tag label, check the colon-separated prefix to determine which type of label it is
    tagNames.forEach((tag) => {
      const [prefix, key] = tag.split(':')
      const column = tagColumns[prefix]
      if (column) {
        column.push(key)
      } else {
        this.billingExportTableLogger.warn(
          `Unknown tag prefix: ${prefix}. Ignoring tag: ${tag}`,
        )
      }
    })

    return Object.values(tagColumns)
  }

  private rawTagsToTagCollection(usageRow: any): TagCollection {
    const parsedTags: TagCollection = {}
    const options = ['tags', 'projectLabels', 'labels']

    options.forEach((option) => {
      const tags: string = usageRow[option]
      if (tags) {
        tags.split(', ').forEach((tag) => {
          const [key, value] = tag.split(': ')
          parsedTags[key] = value
        })
      }
    })

    return parsedTags
  }

  private buildProjectFilter(projects: AccountDetailsOrIdList): string {
    let projectFilter = ''
    try {
      projectFilter = buildAccountFilter(projects, 'project.id')
    } catch (e) {
      this.billingExportTableLogger.warn(
        'Configured list of Google Projects is invalid. Projects must be a list of of IDs or objects containing project IDs. Ignoring project filter...',
      )
    }
    return projectFilter
  }
}

export const buildTagQuery = (columnName: string, keys: string[]): string[] => {
  let propertySelections = '',
    propertyJoins = ''

  if (keys.length > 0) {
    propertySelections = `, STRING_AGG(DISTINCT CONCAT(${columnName}.key, ": ", ${columnName}.value), ", ") AS ${columnName}`

    propertyJoins = `\nLEFT JOIN\n UNNEST(${
      columnName === 'projectLabels' ? 'project.labels' : columnName
    }) AS ${columnName}\n`
    const keyJoins = keys
      .map((tag) => `${columnName}.key = "${tag}"`)
      .join(' OR ')
    propertyJoins += `ON ${keyJoins}`
  }
  return [propertySelections, propertyJoins]
}
