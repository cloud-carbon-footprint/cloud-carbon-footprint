/*
 * © 2021 ThoughtWorks, Inc.
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
  EC2_INSTANCE_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  REDSHIFT_INSTANCE_TYPES,
} from './AWSInstanceTypes'
import moment from 'moment'
import RightsizingRecommendation from './RightsizingRecommendation'
import CostAndUsageReportsRow from './CostAndUsageReportsRow'

export default class AWSMemoryEstimatesBuilder extends FootprintEstimatesDataBuilder {
  constructor(
    rowData: RightsizingRecommendation | CostAndUsageReportsRow,
    memoryEstimator: MemoryEstimator,
  ) {
    super(rowData)

    this.vCpuHours = rowData.vCpuHours
    this.computeProcessors = this.getComputeProcessors(rowData)
<<<<<<< HEAD
    this.instanceType = rowData.currentInstanceType || rowData.instanceType
=======
    this.instanceType = rowData.instanceType
>>>>>>> 876c9974 ([359] wip rightsizing recommendations | Arelys, Cam, Arik)
    this.memoryUsage = this.getMemoryUsage(rowData, this.computeProcessors)
    this.powerUsageEffectiveness = AWS_CLOUD_CONSTANTS.getPUE(rowData.region)
    this.memoryConstants = this.getMemoryConstants(
      this.computeProcessors,
      this.powerUsageEffectiveness,
    )
    this.memoryFootprint = this.getMemoryFootprint(
      memoryEstimator,
      this.memoryUsage,
      this.memoryConstants,
      rowData.region,
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

  private getMemoryUsage(
    rowData: any,
    computeProcessors: string[],
  ): MemoryUsage {
    const [instanceFamily, instanceSize] =
      rowData.currentInstanceType.split('.')

    const processorMemoryGigabytesPerPhysicalChip =
      AWS_CLOUD_CONSTANTS.getMemory(computeProcessors)
    const instanceTypeMemory =
      EC2_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[1]

    const familyInstanceTypes: number[][] = Object.values(
      EC2_INSTANCE_TYPES[instanceFamily],
    )

    const [largestInstanceTypevCpus, largestInstanceTypeMemory] =
      familyInstanceTypes[familyInstanceTypes.length - 1]
    // there are special cases for instance families m5zn and z1d where they are always 2
    const physicalChips = ['m5zn', 'z1d'].includes(instanceFamily)
      ? 2
      : getPhysicalChips(largestInstanceTypevCpus)

    const gigabyteHours = calculateGigabyteHours(
      physicalChips,
      largestInstanceTypeMemory,
      processorMemoryGigabytesPerPhysicalChip,
      instanceTypeMemory,
      moment().daysInMonth() * 24,
    )
    return {
      gigabyteHours,
    }
  }

  private getMemoryConstants(
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

  private getMemoryFootprint(
    memoryEstimator: MemoryEstimator,
    memoryUsage: MemoryUsage,
    computeConstants: CloudConstants,
    region: string,
  ): FootprintEstimate {
    return memoryEstimator.estimate(
      [memoryUsage],
      region,
      AWS_EMISSIONS_FACTORS_METRIC_TON_PER_KWH,
      computeConstants,
    )[0]
  }
}
