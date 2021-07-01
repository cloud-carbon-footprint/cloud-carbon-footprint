/*
 * © 2021 ThoughtWorks, Inc.
 */

import {
  CloudConstants,
  COMPUTE_PROCESSOR_TYPES,
  ComputeEstimator,
  ComputeUsage,
  FootprintEstimate,
  FootprintEstimatesDataBuilder,
} from '@cloud-carbon-footprint/core'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING } from './AWSInstanceTypes'
import CostAndUsageReportsRow from './CostAndUsageReportsRow'
import RightsizingRecommendation from './Recommendations/RightsizingTargetRecommendation'

export default class AWSComputeEstimatesBuilder extends FootprintEstimatesDataBuilder {
  constructor(
    rowData: RightsizingRecommendation | CostAndUsageReportsRow,
    computeEstimator: ComputeEstimator,
  ) {
    super(rowData)

    this.vCpuHours = rowData.vCpuHours
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

  private getComputeProcessors(
    rowData: Partial<FootprintEstimatesDataBuilder>,
  ): string[] {
    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[rowData.instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
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
