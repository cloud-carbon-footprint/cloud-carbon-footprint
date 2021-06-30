/*
 * © 2021 ThoughtWorks, Inc.
 */
import moment from 'moment'
import {
  EC2ResourceDetails,
  RightsizingRecommendation as AwsRightsizingRecommendation,
} from 'aws-sdk/clients/costexplorer'
import { AWS_REGIONS } from './AWSRegions'

export default class RightsizingRecommendation {
  public accountId: string
  public region: string
  public type: string
  public instanceName: string
  public instanceType: string
  public vCpuHours: number
  public costSavings: number
  public targetInstance: Partial<AwsRightsizingRecommendation>

  protected constructor(init: Partial<AwsRightsizingRecommendation>) {
    Object.assign(this, init)
  }

  public getVCpuHours(resourceDetails: EC2ResourceDetails): number {
    // Multiply the number of virtual CPUS by the hours in a month
    return parseFloat(resourceDetails.Vcpu) * moment().utc().daysInMonth() * 24
  }

  public regionMapping: { [region: string]: string } = {
    'EU (Frankfurt)': AWS_REGIONS.EU_CENTRAL_1,
    'South America (Sao Paulo)': AWS_REGIONS.SA_EAST_1,
    'Asia Pacific (Singapore)': AWS_REGIONS.AP_SOUTHEAST_1,
    'Asia Pacific (Mumbai)': AWS_REGIONS.AP_SOUTH_1,
    'US East (Ohio)': AWS_REGIONS.US_EAST_2,
    'US East (N. Virginia)': AWS_REGIONS.US_EAST_1,
    'US West (N. California)': AWS_REGIONS.US_WEST_1,
    'EU (Ireland)': AWS_REGIONS.EU_WEST_1,
    'US West (Oregon)': AWS_REGIONS.US_WEST_2,
    'Asia Pacific (Sydney)': AWS_REGIONS.AP_SOUTHEAST_2,
  }
}
