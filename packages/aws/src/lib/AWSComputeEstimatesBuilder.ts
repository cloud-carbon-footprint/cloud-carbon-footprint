/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstants,
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
    this.region = rowData.region
    this.powerUsageEffectiveness = AWS_CLOUD_CONSTANTS.getPUE(this.region)
    this.computeProcessors = this.getComputeProcessors(
      rowData.instanceType,
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
    )
    this.computeUsage = this.getComputeUsage()
    this.computeConstants = this.getComputeConstants()
    this.computeFootprint = this.getComputeFootprint(
      computeEstimator,
      this.computeUsage,
      this.computeConstants,
      this.region,
    )
  }

  private getComputeUsage(): ComputeUsage {
    return {
      cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      numberOfvCpus: this.vCpuHours,
      usesAverageCPUConstant: true,
    }
  }

  private getComputeConstants(): CloudConstants {
    return {
      minWatts: AWS_CLOUD_CONSTANTS.getMinWatts(this.computeProcessors),
      maxWatts: AWS_CLOUD_CONSTANTS.getMaxWatts(this.computeProcessors),
      powerUsageEffectiveness: this.powerUsageEffectiveness,
      replicationFactor: this.replicationFactor,
    }
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
