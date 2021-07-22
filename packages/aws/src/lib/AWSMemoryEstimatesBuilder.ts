/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  CloudConstants,
  COMPUTE_PROCESSOR_TYPES,
  MemoryEstimator,
  MemoryUsage,
  FootprintEstimate,
  FootprintEstimatesDataBuilder,
  calculateGigabyteHours,
  getPhysicalChips,
} from '@cloud-carbon-footprint/core'
import {
  AWS_CLOUD_CONSTANTS,
  AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
} from '../domain'
import {
  BURSTABLE_INSTANCE_BASELINE_UTILIZATION,
  EC2_INSTANCE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  REDSHIFT_INSTANCE_TYPES,
} from './AWSInstanceTypes'
import RightsizingRecommendation from './Recommendations/RightsizingRecommendation'
import CostAndUsageReportsRow from './CostAndUsageReportsRow'

export default class AWSMemoryEstimatesBuilder extends FootprintEstimatesDataBuilder {
  constructor(
    rowData: RightsizingRecommendation | CostAndUsageReportsRow,
    memoryEstimator: MemoryEstimator,
  ) {
    super(rowData)

    this.vCpuHours = rowData.vCpuHours
    this.instanceType = rowData.instanceType
    this.usageAmount = rowData.usageAmount
    this.region = rowData.region
    this.powerUsageEffectiveness = AWS_CLOUD_CONSTANTS.getPUE(this.region)
    this.computeProcessors = this.getComputeProcessors(
      rowData.instanceType,
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
    )
    this.memoryUsage = this.getMemoryUsage()
    this.memoryConstants = this.getMemoryConstants()
    this.memoryFootprint = this.getMemoryFootprint(
      memoryEstimator,
      this.memoryUsage,
      this.memoryConstants,
      this.region,
    )
  }

  private getGigabytesFromInstanceTypeAndProcessors(): number {
    const [instanceFamily, instanceSize] = this.instanceType.split('.')

    // check to see if the instance type is contained in the AWSInstanceTypes lists
    // or if the instance type is not a burstable instance, otherwise return void
    const { isValidInstanceType, isBurstableInstance } =
      this.checkInstanceTypes(instanceFamily)
    if (!isValidInstanceType || isBurstableInstance) return

    // grab the list of processors per instance type
    // and then the aws specific memory constant for the processors
    const processors = INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[
      this.instanceType
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
      this.usageAmount,
    )
  }

  public checkInstanceTypes(instanceFamily: string): {
    [key: string]: boolean
  } {
    // a valid instance type is one that is mapped in the AWSInstanceTypes lists
    const isValidInstanceType =
      Object.keys(EC2_INSTANCE_TYPES).includes(instanceFamily) ||
      Object.keys(REDSHIFT_INSTANCE_TYPES).includes(instanceFamily)
    // we are not able to calculate memory usage for burstable (t family) instances
    // unlike other instance families, the largest t instance is not equal to a full machine
    const isBurstableInstance = Object.keys(
      BURSTABLE_INSTANCE_BASELINE_UTILIZATION,
    ).includes(this.instanceType)
    return { isValidInstanceType, isBurstableInstance }
  }

  private getMemoryUsage(): MemoryUsage {
    return {
      gigabyteHours: this.getGigabytesFromInstanceTypeAndProcessors(),
    }
  }

  private getMemoryConstants(): CloudConstants {
    return {
      minWatts: AWS_CLOUD_CONSTANTS.getMinWatts(this.computeProcessors),
      maxWatts: AWS_CLOUD_CONSTANTS.getMaxWatts(this.computeProcessors),
      powerUsageEffectiveness: this.powerUsageEffectiveness,
      replicationFactor: this.replicationFactor,
    }
  }

  private getMemoryFootprint(
    memoryEstimator: MemoryEstimator,
    memoryUsage: MemoryUsage,
    memoryConstants: CloudConstants,
    region: string,
  ): FootprintEstimate {
    return memoryEstimator.estimate(
      [memoryUsage],
      region,
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      memoryConstants,
    )[0]
  }
}
