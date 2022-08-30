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
import { containsAny } from '@cloud-carbon-footprint/common'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import { GPU_INSTANCES_TYPES } from './AWSInstanceTypes'
import CostAndUsageReportsRow from './CostAndUsageReportsRow'
import RightsizingRecommendation from './Recommendations/Rightsizing/RightsizingTargetRecommendation'
import ComputeOptimizerRecommendationWithProcessors from './Recommendations/ComputeOptimizer/ComputeOptimizerRecommendationWithProcessors'

export default class AWSComputeEstimatesBuilder extends FootprintEstimatesDataBuilder {
  constructor(
    rowData:
      | RightsizingRecommendation
      | CostAndUsageReportsRow
      | ComputeOptimizerRecommendationWithProcessors,
    computeEstimator: ComputeEstimator,
  ) {
    super(rowData)

    this.vCpuHours = rowData.vCpuHours
    this.region = rowData.region
    this.powerUsageEffectiveness = AWS_CLOUD_CONSTANTS.getPUE(this.region)
    this.computeProcessors = rowData.getComputeProcessors()
    this.gpuComputeProcessors = rowData.getGPUComputeProcessors()
    this.computeConstants = this.getComputeConstants()
    this.computeFootprint = this.getComputeFootprint(
      computeEstimator,
      this.region,
    )
  }

  private getComputeUsage(): ComputeUsage {
    return {
      cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: this.vCpuHours,
      usesAverageCPUConstant: true,
    }
  }

  private getGpuComputeUsage(): ComputeUsage {
    return {
      cpuUtilizationAverage: AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020,
      vCpuHours: this.gpuHours, // TODO - explain object key
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

  private getGpuComputeConstants(): CloudConstants {
    return {
      minWatts: AWS_CLOUD_CONSTANTS.getMinWatts(this.gpuComputeProcessors),
      maxWatts: AWS_CLOUD_CONSTANTS.getMaxWatts(this.gpuComputeProcessors),
      powerUsageEffectiveness: this.powerUsageEffectiveness,
      replicationFactor: this.replicationFactor,
    }
  }

  private getComputeFootprint(
    computeEstimator: ComputeEstimator,
    region: string,
  ): FootprintEstimate {
    const computeEstimate = computeEstimator.estimate(
      [this.getComputeUsage()],
      region,
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      this.getComputeConstants(),
    )[0]

    if (this.isGpuInstance()) {
      const gpuComputeEstimate = computeEstimator.estimate(
        [this.getGpuComputeUsage()],
        region,
        AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
        this.getGpuComputeConstants(),
      )[0]

      computeEstimate.kilowattHours += gpuComputeEstimate.kilowattHours
      computeEstimate.co2e += gpuComputeEstimate.co2e
      return computeEstimate
    }

    return computeEstimate
  }

  private isGpuInstance(): boolean {
    return containsAny(Object.keys(GPU_INSTANCES_TYPES), this.usageType)
  }
}
