/*
 * © 2021 ThoughtWorks, Inc.
 */

import moment from 'moment'
import { RightsizingRecommendation as AwsRightsizingRecommendation } from 'aws-sdk/clients/costexplorer'
import RightsizingRecommendation from './RightsizingRecommendation'

export default class RightsizingTargetRecommendation extends RightsizingRecommendation {
  constructor(rightsizingRecommendationData: AwsRightsizingRecommendation) {
    super(rightsizingRecommendationData)

    this.accountId = rightsizingRecommendationData.AccountId
    this.type = rightsizingRecommendationData.RightsizingType
    this.region = this.getMappedRegion(
      rightsizingRecommendationData.ModifyRecommendationDetail
        .TargetInstances[0].ResourceDetails.EC2ResourceDetails.Region,
    )
    this.instanceName = 'Recommend new instance'
    this.instanceType =
      rightsizingRecommendationData.ModifyRecommendationDetail.TargetInstances[0].ResourceDetails.EC2ResourceDetails.InstanceType
    this.vCpuHours = this.getVCpuHours(
      rightsizingRecommendationData.ModifyRecommendationDetail
        .TargetInstances[0].ResourceDetails.EC2ResourceDetails,
    )
    this.costSavings = parseFloat(
      rightsizingRecommendationData.ModifyRecommendationDetail
        .TargetInstances[0].EstimatedMonthlySavings,
    )
    this.usageAmount = moment().utc().daysInMonth() * 24
  }
}
