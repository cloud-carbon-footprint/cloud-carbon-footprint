/*
 * © 2021 Thoughtworks, Inc.
 */

import { RightsizingRecommendation as AwsRightsizingRecommendation } from 'aws-sdk/clients/costexplorer'
import { getHoursInMonth } from '@cloud-carbon-footprint/common'
import RightsizingRecommendation from './RightsizingRecommendation'

export default class RightsizingCurrentRecommendation extends RightsizingRecommendation {
  constructor(rightsizingRecommendationData: AwsRightsizingRecommendation) {
    super(rightsizingRecommendationData)

    this.accountId = rightsizingRecommendationData.AccountId
    this.type = rightsizingRecommendationData.RightsizingType
    this.region = this.getMappedRegion(
      rightsizingRecommendationData.CurrentInstance.ResourceDetails
        .EC2ResourceDetails.Region,
    )
    this.instanceName =
      rightsizingRecommendationData.CurrentInstance.InstanceName
    this.instanceType =
      rightsizingRecommendationData.CurrentInstance.ResourceDetails.EC2ResourceDetails.InstanceType
    this.vCpuHours = this.getVCpuHours(
      rightsizingRecommendationData.CurrentInstance.ResourceDetails
        .EC2ResourceDetails,
    )
    this.resourceId = rightsizingRecommendationData.CurrentInstance.ResourceId
    this.costSavings =
      parseFloat(
        rightsizingRecommendationData.TerminateRecommendationDetail
          ?.EstimatedMonthlySavings,
      ) || 0
    this.usageAmount = getHoursInMonth()
  }
}
