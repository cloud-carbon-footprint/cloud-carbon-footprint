/*
 * © 2021 Thoughtworks, Inc.
 */

import {
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
  constructor(
    private readonly computeEstimator: ComputeEstimator,
    private readonly memoryEstimator: MemoryEstimator,
  ) {
    this.onPremiseDataReportLogger = new Logger('OnPremiseDataReport')
  }

  public getEstimates(usageRows: OnPremiseDataInput[]): OnPremiseDataOutput[] {
    const results: OnPremiseDataOutput[] = []

    usageRows.map((onPremiseDataRow: OnPremiseDataReportRow) => {
      const onPremiseDataReportRow: OnPremiseDataReportRow =
        new OnPremiseDataReportRow(onPremiseDataRow)

      const footprintEstimate = this.getEstimateByMachineType(
        onPremiseDataReportRow,
      )

      if (footprintEstimate) {
        const { kilowattHours, co2e } = footprintEstimate
        const appendedRows = { ...onPremiseDataRow, kilowattHours, co2e }
        results.push(appendedRows)
      }
      return []
    })

    return results
  }

  private getEstimateByMachineType(
    onPremiseDataReportRow: OnPremiseDataReportRow,
  ): Partial<FootprintEstimate> {
    const emissionsFactors: CloudConstantsEmissionsFactors =
      ON_PREMISE_EMISSIONS_FACTORS_METRIC_TON_PER_KWH
    const powerUsageEffectiveness: number = ON_PREMISE_CLOUD_CONSTANTS.getPUE()
    switch (onPremiseDataReportRow.machineType) {
      case ON_PREMISE_MACHINE_TYPES.SERVER:
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
      default:
        this.onPremiseDataReportLogger.warn(
          `Unsupported machine type: ${onPremiseDataReportRow.machineType}`,
        )
        return {
          kilowattHours: 0,
          co2e: 0,
        }
    }
  }

  private getComputeFootprintEstimate(
    onPremiseDataReportRow: OnPremiseDataReportRow,
    averagePowerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const {
      region,
      usageHours,
      processorFamilies,
      serverUtilization,
      powerUsageEffectiveness,
    } = onPremiseDataReportRow
    const computeUsage: ComputeUsage = {
      cpuUtilizationAverage: serverUtilization
        ? serverUtilization
        : ON_PREMISE_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      // TODO: update vCpuHours variable name as usageHours for on-prem
      vCpuHours: usageHours,
      usesAverageCPUConstant: true,
    }

    const computeConstants: CloudConstants = {
      minWatts: ON_PREMISE_CLOUD_CONSTANTS.getMinWatts(processorFamilies),
      maxWatts: ON_PREMISE_CLOUD_CONSTANTS.getMaxWatts(processorFamilies),
      powerUsageEffectiveness: powerUsageEffectiveness
        ? powerUsageEffectiveness
        : averagePowerUsageEffectiveness,
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
    averagePowerUsageEffectiveness: number,
    emissionsFactors: CloudConstantsEmissionsFactors,
  ): FootprintEstimate {
    const {
      region,
      usageHours,
      memory,
      processorFamilies,
      powerUsageEffectiveness,
    } = onPremiseDataReportRow
    const memoryUsage: MemoryUsage = {
      gigabyteHours: this.getGigabyteHours(
        usageHours,
        memory,
        processorFamilies,
      ),
    }

    const memoryConstants: CloudConstants = {
      powerUsageEffectiveness: powerUsageEffectiveness
        ? powerUsageEffectiveness
        : averagePowerUsageEffectiveness,
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
}
