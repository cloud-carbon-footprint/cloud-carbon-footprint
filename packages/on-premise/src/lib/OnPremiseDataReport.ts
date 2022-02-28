/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  configLoader,
  Logger,
  OnPremiseDataInput,
  OnPremiseDataOutput,
} from '@cloud-carbon-footprint/common'
import {
  CloudConstants,
  CloudConstantsEmissionsFactors,
  ComputeEstimator,
  ComputeUsage,
  FootprintEstimate,
  MemoryEstimator,
  MemoryUsage,
} from '@cloud-carbon-footprint/core'

import { OnPremiseDataReportRow, ON_PREMISE_MACHINE_TYPES } from '.'

import {
  ON_PREMISE_CLOUD_CONSTANTS,
  ON_PREMISE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'

export default class OnPremiseDataReport {
  private readonly onPremiseDataReportLogger: Logger
  private readonly serverCpuUtilization: number
  private readonly serverAverageWatts: number
  private readonly laptopCpuUtilization: number
  private readonly laptopAverageWatts: number
  private readonly desktopCpuUtilization: number
  private readonly desktopAverageWatts: number
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
  ) {
    this.onPremiseDataReportLogger = new Logger('OnPremiseDataReport')
    this.serverCpuUtilization = configLoader().ON_PREMISE.SERVER.CPU_UTILIZATION
    this.serverAverageWatts = configLoader().ON_PREMISE.SERVER.AVERAGE_WATTS
    this.laptopCpuUtilization = configLoader().ON_PREMISE.LAPTOP.CPU_UTILIZATION
    this.laptopAverageWatts = configLoader().ON_PREMISE.LAPTOP.AVERAGE_WATTS
    this.desktopCpuUtilization =
      configLoader().ON_PREMISE.DESKTOP.CPU_UTILIZATION
    this.desktopAverageWatts = configLoader().ON_PREMISE.DESKTOP.AVERAGE_WATTS
  }

  public getEstimates(usageRows: OnPremiseDataInput[]): OnPremiseDataOutput[] {
    const results: OnPremiseDataOutput[] = []

    usageRows.map((onPremiseDataRow: OnPremiseDataReportRow) => {
      const onPremiseDataReportRow: OnPremiseDataReportRow =
        new OnPremiseDataReportRow(onPremiseDataRow)

      const footprintEstimate = this.getFootprintEstimate(
        onPremiseDataReportRow,
      )

      if (footprintEstimate) {
        const { kilowattHours, co2e } = footprintEstimate
        const { usageHours } = onPremiseDataReportRow
        const appendedRows = {
          ...onPremiseDataRow,
          usageHours,
          kilowattHours,
          co2e,
        }
        results.push(appendedRows)
      }
      return []
    })

    return results
  }

  private getFootprintEstimate(
    onPremiseDataReportRow: OnPremiseDataReportRow,
  ): Partial<FootprintEstimate> {
    const emissionsFactors: CloudConstantsEmissionsFactors =
      ON_PREMISE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
    const powerUsageEffectiveness: number =
      onPremiseDataReportRow.powerUsageEffectiveness
        ? onPremiseDataReportRow.powerUsageEffectiveness
        : ON_PREMISE_CLOUD_CONSTANTS.getPUE()

    const computeFootprint = this.getComputeFootprintEstimate(
      onPremiseDataReportRow,
      powerUsageEffectiveness,
      emissionsFactors,
    )

    const memoryFootprint = this.getMemoryFootprintEstimate(
      onPremiseDataReportRow,
      powerUsageEffectiveness,
      emissionsFactors,
    )

    if (memoryFootprint.kilowattHours) {
      const kilowattHours =
        computeFootprint.kilowattHours + memoryFootprint.kilowattHours

      return {
        kilowattHours: kilowattHours,
        co2e: computeFootprint.co2e + memoryFootprint.co2e,
      }
    }
    return computeFootprint
  }

  private getComputeFootprintEstimate(
    onPremiseDataReportRow: OnPremiseDataReportRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const {
      region,
      usageHours,
      processorFamilies,
      cpuUtilization,
      machineType,
    } = onPremiseDataReportRow

    const { configuredCpuUtilization, averageWatts } =
      this.getConfigurableCoefficients(machineType, cpuUtilization)

    const computeUsage: ComputeUsage = {
      cpuUtilizationAverage: configuredCpuUtilization,
      vCpuHours: usageHours,
      usesAverageCPUConstant: true,
    }

    const computeConstants: CloudConstants = {
      minWatts: ON_PREMISE_CLOUD_CONSTANTS.getMinWatts(processorFamilies),
      maxWatts: ON_PREMISE_CLOUD_CONSTANTS.getMaxWatts(processorFamilies),
      averageWatts,
      powerUsageEffectiveness,
    }

    return this.computeEstimator.estimate(
      [computeUsage],
      region,
      emissionsFactors,
      computeConstants,
    )[0]
  }

  private getMemoryFootprintEstimate(
    onPremiseDataReportRow: OnPremiseDataReportRow,
    powerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const { region, usageHours, memory, processorFamilies } =
      onPremiseDataReportRow

    const memoryUsage: MemoryUsage = {
      gigabyteHours: this.getGigabyteHours(
        usageHours,
        memory,
        processorFamilies,
      ),
    }

    const memoryConstants: CloudConstants = {
      powerUsageEffectiveness,
    }

    const memoryEstimate = this.memoryEstimator.estimate(
      [memoryUsage],
      region,
      emissionsFactors,
      memoryConstants,
    )[0]

    return memoryEstimate
  }

  private getGigabyteHours(
    usageHours: number,
    calculatedMemory: number,
    processorFamilies: string[],
  ): number {
    const processorMemory =
      ON_PREMISE_CLOUD_CONSTANTS.getMemory(processorFamilies)
    return Math.max(0, calculatedMemory - processorMemory) * usageHours
  }

  private getConfigurableCoefficients(
    machineType: string,
    cpuUtilization: number,
  ): { [key: string]: number } {
    let configuredCpuUtilization = cpuUtilization
      ? cpuUtilization
      : ON_PREMISE_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020
    let averageWatts
    switch (machineType) {
      case ON_PREMISE_MACHINE_TYPES.SERVER:
        if (this.serverAverageWatts) averageWatts = this.serverAverageWatts
        if (this.serverCpuUtilization)
          configuredCpuUtilization = this.serverCpuUtilization
        return { configuredCpuUtilization, averageWatts }

      case ON_PREMISE_MACHINE_TYPES.LAPTOP:
        if (this.laptopAverageWatts) averageWatts = this.laptopAverageWatts
        if (this.laptopCpuUtilization)
          configuredCpuUtilization = this.laptopCpuUtilization
        return { configuredCpuUtilization, averageWatts }

      case ON_PREMISE_MACHINE_TYPES.DESKTOP:
        if (this.desktopAverageWatts) averageWatts = this.desktopAverageWatts
        if (this.desktopCpuUtilization)
          configuredCpuUtilization = this.desktopCpuUtilization
        return { configuredCpuUtilization, averageWatts }

      default:
        return { configuredCpuUtilization, averageWatts: undefined }
    }
  }
}
