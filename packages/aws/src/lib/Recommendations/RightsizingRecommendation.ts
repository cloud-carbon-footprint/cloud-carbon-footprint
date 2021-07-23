/*
 * © 2021 Thoughtworks, Inc.
 */
import {
  EC2ResourceDetails,
  RightsizingRecommendation as AwsRightsizingRecommendation,
} from 'aws-sdk/clients/costexplorer'
import { containsAny, getHoursInMonth } from '@cloud-carbon-footprint/common'
import { AWS_MAPPED_REGION_NAMES_TO_CODES, AWS_REGIONS } from '../AWSRegions'
import { BURSTABLE_INSTANCE_BASELINE_UTILIZATION } from '../AWSInstanceTypes'
import { AWS_CLOUD_CONSTANTS } from '../../domain'

export default class RightsizingRecommendation {
  public accountId: string
  public region: string
  public type: string
  public instanceName: string
  public resourceId: string
  public instanceType: string
  public vCpuHours: number
  public costSavings: number
  public usageAmount: number

  protected constructor(init: Partial<AwsRightsizingRecommendation>) {
    Object.assign(this, init)
  }

  public getVCpuHours(resourceDetails: EC2ResourceDetails): number {
    if (
      containsAny(
        Object.keys(BURSTABLE_INSTANCE_BASELINE_UTILIZATION),
        resourceDetails.InstanceType,
      )
    ) {
      return (
        ((parseFloat(resourceDetails.Vcpu) *
          BURSTABLE_INSTANCE_BASELINE_UTILIZATION[
            resourceDetails.InstanceType
          ]) /
          AWS_CLOUD_CONSTANTS.AVG_CPU_UTILIZATION_2020) *
        getHoursInMonth()
      )
    }
    // Multiply the number of virtual CPUS by the hours in a month
    return parseFloat(resourceDetails.Vcpu) * getHoursInMonth()
  }

  public getMappedRegion(region: string): string {
    return AWS_MAPPED_REGION_NAMES_TO_CODES[region] || AWS_REGIONS.UNKNOWN
  }
}
