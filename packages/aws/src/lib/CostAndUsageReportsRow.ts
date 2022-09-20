/*
 * © 2021 Thoughtworks, Inc.
 */

import {
  BillingDataRow,
  COMPUTE_PROCESSOR_TYPES,
} from '@cloud-carbon-footprint/core'
import { containsAny, TagCollection } from '@cloud-carbon-footprint/common'
import {
  BURSTABLE_INSTANCE_BASELINE_UTILIZATION,
  EC2_INSTANCE_TYPES,
  GPU_INSTANCES_TYPES,
  INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING,
  INSTANCE_TYPE_GPU_PROCESSOR_MAPPING,
  MSK_INSTANCE_TYPES,
  REDSHIFT_INSTANCE_TYPES,
} from './AWSInstanceTypes'
import { AWS_CLOUD_CONSTANTS } from '../domain'
import { concat } from 'ramda'
import { AWS_REPLICATION_FACTORS_FOR_SERVICES } from './ReplicationFactors'
import { KNOWN_USAGE_UNITS } from './CostAndUsageTypes'

const GLUE_VCPUS_PER_USAGE = 4
const SIMPLE_DB_VCPUS_PER_USAGE = 1

export default class CostAndUsageReportsRow extends BillingDataRow {
  constructor(
    timestamp: Date,
    accountId: string,
    accountName: string,
    region: string,
    serviceName: string,
    usageType: string,
    usageUnit: string,
    vCpus: number | null,
    usageAmount: number,
    cost: number,
    tags: TagCollection,
  ) {
    super({
      timestamp,
      accountId,
      accountName,
      region,
      serviceName,
      usageType,
      usageUnit: cleanUsageUnit(usageUnit, serviceName, usageType),
      vCpus,
      usageAmount: cleanUsageAmount(usageAmount, usageUnit, serviceName),
      cost,
      tags,
    })

    this.vCpuHours = this.getVCpuHours(this.vCpus)
    this.gpuHours = this.getGpuHours()
    this.cloudProvider = 'AWS'
    this.instanceType = this.parseInstanceTypeFromUsageType()
    this.replicationFactor = this.getReplicationFactor()
  }

  private getVCpuHours(vCpuFromReport: number): number {
    const instanceType = this.extractInstanceTypeFromUsageType()

    // When the service is AWS Glue, 4 virtual CPUs are provisioned (from AWS Docs).
    if (this.serviceName === 'AWSGlue')
      return GLUE_VCPUS_PER_USAGE * this.usageAmount
    if (this.serviceName === 'AmazonSimpleDB')
      return SIMPLE_DB_VCPUS_PER_USAGE * this.usageAmount
    if (this.usageType.includes('Aurora:ServerlessUsage'))
      return this.usageAmount / 4
    if (containsAny(['Fargate-vCPU-Hours', 'CPUCredits'], this.usageType))
      return this.usageAmount
    if (
      containsAny(
        Object.keys(BURSTABLE_INSTANCE_BASELINE_UTILIZATION),
        this.usageType,
      )
    ) {
      return (
        this.getBurstableInstanceVCPu(instanceType.split('.', 2).join('.')) *
        this.usageAmount
      )
    }
    if (!vCpuFromReport)
      return this.extractVCpuFromInstanceType(instanceType) * this.usageAmount
    return vCpuFromReport * this.usageAmount
  }

  private getGpuHours(): number {
    const instanceType = this.extractInstanceTypeFromUsageType()
    return GPU_INSTANCES_TYPES[instanceType] * this.usageAmount || 0
  }

  private extractInstanceTypeFromUsageType(): string {
    return this.usageType
      .split(':')
      .pop()
      .replace(/^((db|cache|dax|dms|ml|mq|KernelGateway-ml|.+Kafka)\.)/, '')
  }

  private getBurstableInstanceVCPu(instanceType: string) {
    return (
      this.extractVCpuFromInstanceType(instanceType) *
      (BURSTABLE_INSTANCE_BASELINE_UTILIZATION[instanceType] /
        AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020)
    )
  }

  private extractVCpuFromInstanceType(instanceType: string): number {
    const [instanceFamily, instanceSize] = instanceType.split('.')
    if (this.usageType.includes('Kafka'))
      return MSK_INSTANCE_TYPES[`Kafka${this.usageType.split('Kafka').pop()}`]
    if (this.serviceName === 'AmazonRedshift')
      return REDSHIFT_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[0] / 3600
    return EC2_INSTANCE_TYPES[instanceFamily]?.[instanceSize]?.[0]
  }

  public parseInstanceTypeFromUsageType(): string {
    // Sometimes the CUR usage type for xlarge instances returns only as 'xl', so append 'arge'
    // to make it consistent with other responce data.
    if (this.usageType.endsWith('xl'))
      this.usageType = this.usageType.concat('arge')

    const prefixes = ['db', 'cache', 'Kafka']
    const includesPrefix = prefixes.find((prefix) =>
      this.usageType.includes(prefix),
    )
    return includesPrefix
      ? this.usageType.split(concat(includesPrefix, '.')).pop()
      : this.usageType.split(':').pop()
  }

  private getReplicationFactor(): number {
    return (
      (AWS_REPLICATION_FACTORS_FOR_SERVICES[this.serviceName] &&
        AWS_REPLICATION_FACTORS_FOR_SERVICES[this.serviceName](
          this.usageType,
          this.region,
        )) ||
      AWS_REPLICATION_FACTORS_FOR_SERVICES.DEFAULT()
    )
  }

  public getComputeProcessors(): string[] {
    if (this.serviceName === 'AWSLambda') {
      if (this.usageType.endsWith('-ARM')) {
        return [COMPUTE_PROCESSOR_TYPES.AWS_GRAVITON_2]
      } else {
        return [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
      }
    }

    return (
      INSTANCE_TYPE_COMPUTE_PROCESSOR_MAPPING[this.instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }

  public getGPUComputeProcessors(): string[] {
    if (this.serviceName === 'AWSLambda') {
      return [COMPUTE_PROCESSOR_TYPES.UNKNOWN]
    }

    return (
      INSTANCE_TYPE_GPU_PROCESSOR_MAPPING[this.instanceType] || [
        COMPUTE_PROCESSOR_TYPES.UNKNOWN,
      ]
    )
  }
}

const cleanUsageUnit = (
  rawUsageUnit: string,
  serviceName: string,
  usageType: string,
): string => {
  if (usageType.includes('Fargate-GB-Hours')) {
    return KNOWN_USAGE_UNITS.GB_HOURS
  }

  if (isRedshiftComputeUsage(serviceName, rawUsageUnit)) {
    return KNOWN_USAGE_UNITS.HOURS_1
  }

  return rawUsageUnit
}

const isRedshiftComputeUsage = (
  serviceName: string,
  usageUnit: string,
): boolean => {
  return (
    serviceName === 'AmazonRedshift' &&
    usageUnit === KNOWN_USAGE_UNITS.SECONDS_1
  )
}

const cleanUsageAmount = (
  rawUsageAmount: number,
  rawUsageUnit: string,
  serviceName: string,
): number => {
  if (isRedshiftComputeUsage(serviceName, rawUsageUnit)) {
    return rawUsageAmount / 3600
  }

  return rawUsageAmount
}
