/*
 * © 2021 ThoughtWorks, Inc.
 */
import moment from 'moment'
import {
  EC2ResourceDetails,
  RightsizingRecommendation as AwsRightsizingRecommendation,
} from 'aws-sdk/clients/costexplorer'
import { AWS_REGIONS } from './AWSRegions'

const regionMapping: { [region: string]: string } = {
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

export default class RightsizingRecommendation {
  public accountId: string
  public region: string
  public type: string
  public currentInstanceName: string
  public currentInstanceType: string
  public currentInstanceVcpuHours: number
  public costSavings: number
  constructor(rightsizingRecommendationData: AwsRightsizingRecommendation) {
    this.accountId = rightsizingRecommendationData.AccountId
    this.type = rightsizingRecommendationData.RightsizingType
    this.region =
      regionMapping[
        rightsizingRecommendationData.CurrentInstance.ResourceDetails.EC2ResourceDetails.Region
      ]
    this.currentInstanceName =
      rightsizingRecommendationData.CurrentInstance.InstanceName
    this.currentInstanceType =
      rightsizingRecommendationData.CurrentInstance.ResourceDetails.EC2ResourceDetails.InstanceType
    this.currentInstanceVcpuHours = this.getVCpuHours(
      rightsizingRecommendationData.CurrentInstance.ResourceDetails
        .EC2ResourceDetails,
    )
    this.costSavings = parseFloat(
      rightsizingRecommendationData.TerminateRecommendationDetail
        .EstimatedMonthlySavings,
    )
  }

  private getVCpuHours(resourceDetails: EC2ResourceDetails): number {
    // Multiply the number of virtual CPUS by the hours in a month
    return parseInt(resourceDetails.Vcpu) * moment().utc().daysInMonth() * 24
  }
}
