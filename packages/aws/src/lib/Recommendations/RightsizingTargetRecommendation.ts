/*
 * © 2021 Thoughtworks, Inc.
 */

import { RightsizingRecommendation as AwsRightsizingRecommendation } from 'aws-sdk/clients/costexplorer'
import { getHoursInMonth } from '@cloud-carbon-footprint/common'
import RightsizingRecommendation from './RightsizingRecommendation'

export default class RightsizingTargetRecommendation extends RightsizingRecommendation {
  constructor(rightsizingRecommendationData: AwsRightsizingRecommendation) {
    super(rightsizingRecommendationData)
    const targetInstance =
      rightsizingRecommendationData.ModifyRecommendationDetail.TargetInstances.pop()

    this.accountId = rightsizingRecommendationData.AccountId
    this.type = rightsizingRecommendationData.RightsizingType
    this.region = this.getMappedRegion(
      targetInstance.ResourceDetails.EC2ResourceDetails.Region,
    )
    this.instanceName = 'Recommend new instance'
    this.instanceType =
      targetInstance.ResourceDetails.EC2ResourceDetails.InstanceType
    this.vCpuHours = this.getVCpuHours(
      targetInstance.ResourceDetails.EC2ResourceDetails,
    )
    this.costSavings = parseFloat(targetInstance.EstimatedMonthlySavings)
    this.usageAmount = getHoursInMonth()
  }
}
