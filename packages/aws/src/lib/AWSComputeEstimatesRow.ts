/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  CloudConstants,
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  ComputeUsage,
  FootprintEstimate,
  FootprintEstimatesDataRow,
} from '@cloud-carbon-footprint/core'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING } from './AWSInstanceTypes'

export default class AWSComputeEstimatesRow extends FootprintEstimatesDataRow {
  constructor(rowData: any, computeEstimator: ComputeEstimator) {
    super(rowData)

    this.vCpuHours = rowData.currentInstanceVcpuHours || rowData.vCpuHours
    this.computeUsage = this.getComputeUsage()
    this.computeProcessors = this.getComputeProcessors(rowData)
    this.powerUsageEffectiveness = AWS_CLOUD_CONSTANTS.getPUE(rowData.region)
    this.computeConstants = this.getComputeConstants(
      this.computeProcessors,
      this.powerUsageEffectiveness,
    )
    this.computeFootprint = this.getComputeFootprint(
      computeEstimator,
      this.computeUsage,
      this.computeConstants,
      rowData.region,
    )
  }

  private getComputeUsage(): ComputeUsage {
    return {
      cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: this.vCpuHours,
      usesAverageCPUConstant: true,
    }
  }

  private getComputeConstants(
    computeProcessors: string[],
    powerUsageEffectiveness: number,
  ): CloudConstants {
    return {
      minWatts: AWS_CLOUD_CONSTANTS.getMinWatts(computeProcessors),
      maxWatts: AWS_CLOUD_CONSTANTS.getMaxWatts(computeProcessors),
      powerUsageEffectiveness: powerUsageEffectiveness,
    }
  }

  private getComputeProcessors(rowData: any): string[] {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
        rowData.currentInstanceType || rowData.instanceType
      ] || [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
    )
  }

  private getComputeFootprint(
    computeEstimator: ComputeEstimator,
    computeUsage: ComputeUsage,
    computeConstants: CloudConstants,
    region: string,
  ): FootprintEstimate {
    return computeEstimator.estimate(
      [computeUsage],
      region,
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      computeConstants,
    )[0]
  }
}
